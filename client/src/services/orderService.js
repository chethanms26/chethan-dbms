import api from './api';

export const orderService = {
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  getOrdersByCustomer: async (customerId) => {
    const response = await api.get(`/orders/customer/${customerId}`);
    return response.data;
  },

  getOrderStatistics: async () => {
    const response = await api.get('/orders/statistics');
    return response.data;
  },

  // Returns created order_id
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
};
