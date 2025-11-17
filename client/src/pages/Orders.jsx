import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import OrderList from '../components/orders/OrderList';
import OrderDetails from '../components/orders/OrderDetails';
import CreateOrderForm from '../components/orders/CreateOrderForm';
import { Plus, ShoppingCart } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersAndProducts = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        customerService.getAllCustomers(),
        productService.getAllProducts(),
      ]);

      if (customersRes.success) setCustomers(customersRes.data);
      if (productsRes.success) setProducts(productsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateOrder = () => {
    fetchCustomersAndProducts();
    setCreateModalOpen(true);
  };

  const handleViewDetails = async (order) => {
    try {
      const response = await orderService.getOrderById(order.order_id);
      if (response.success) {
        setSelectedOrder(response.data);
        setDetailsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Failed to fetch order details');
    }
  };

  const handleSubmitOrder = async (formData) => {
    try {
      const response = await orderService.createOrder(formData);

      if (!response.success) {
        alert("Failed to create order");
        return;
      }

      const orderId = response.data.order_id;

      alert("Order created successfully! Redirecting to payment...");
      setCreateModalOpen(false);

      // Correct redirect
      navigate(`/payments/${orderId}`);

      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusCounts = () => {
    return {
      pending: orders.filter(o => o.status === 'Pending').length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="h-8 w-8 mr-3 text-primary-600" />
            Orders
          </h1>
          <p className="text-gray-600 mt-1">Manage customer orders</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleCreateOrder}>
          Create Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><p className="text-center text-gray-600 text-sm">Total Orders</p><p className="text-center text-3xl font-bold text-gray-900 mt-2">{orders.length}</p></Card>
        <Card><p className="text-center text-gray-600 text-sm">Pending</p><p className="text-center text-3xl font-bold text-yellow-600 mt-2">{statusCounts.pending}</p></Card>
        <Card><p className="text-center text-gray-600 text-sm">Processing</p><p className="text-center text-3xl font-bold text-blue-600 mt-2">{statusCounts.processing}</p></Card>
        <Card><p className="text-center text-gray-600 text-sm">Shipped</p><p className="text-center text-3xl font-bold text-primary-600 mt-2">{statusCounts.shipped}</p></Card>
        <Card><p className="text-center text-gray-600 text-sm">Delivered</p><p className="text-center text-3xl font-bold text-green-600 mt-2">{statusCounts.delivered}</p></Card>
      </div>

      <Card>
        {loading ? <Loader /> : <OrderList orders={orders} onViewDetails={handleViewDetails} />}
      </Card>

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Order"
        size="xl"
      >
        <CreateOrderForm
          customers={customers}
          products={products}
          onSubmit={handleSubmitOrder}
          onCancel={() => setCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Order Details"
        size="xl"
      >
        <OrderDetails order={selectedOrder} />
      </Modal>
    </div>
  );
};

export default Orders;
