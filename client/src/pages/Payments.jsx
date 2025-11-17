// client/src/pages/Payments.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const Payments = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('No order selected for payment.');
      setLoading(false);
      return;
    }
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/orders/${orderId}`);
      if (res.data?.success && res.data.data) {
        const backend = res.data.data;
        const items = (backend.order_lines || []).map(line => ({
          product_id: line.product_id,
          product_name: line.product_name,
          quantity: line.quantity,
          unit_price: line.price
        }));
        setOrder({
          order_id: backend.order_id,
          customer_name: backend.customer_name,
          total_amount: backend.total_amount,
          items
        });
      } else {
        setError('Failed to fetch order details.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleFakePay = async () => {
    if (!order) return;
    try {
      setPaying(true);
      setError('');
      await new Promise(r => setTimeout(r, 800));

      const res = await axios.post('/api/payments/pay', {
        order_id: order.order_id,
        amount: order.total_amount,
        method: 'SIMULATED'
      });

      if (res.data?.success) {
        alert('Payment successful!');
        navigate('/orders');
      } else {
        setError('Payment failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Payment request failed.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Payment</h2>

      {error && <div className="text-red-600 mb-4 font-medium">{error}</div>}

      {order ? (
        <div className="bg-white shadow rounded p-6">
          <p><b>Order ID:</b> {order.order_id}</p>
          <p><b>Customer:</b> {order.customer_name}</p>

          <p className="mt-4"><b>Items:</b></p>
          <ul className="list-disc pl-6">
            {order.items.map((it) => (
              <li key={it.product_id}>
                {it.product_name} — {it.quantity} × ₹{it.unit_price}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xl font-semibold">
            Total: ₹{order.total_amount}
          </p>

          <div className="mt-6 flex gap-3">
            <Button variant="primary" onClick={handleFakePay} disabled={paying}>
              {paying ? 'Processing...' : 'Pay Now'}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/orders')}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div>No order details available.</div>
      )}
    </div>
  );
};

export default Payments;
