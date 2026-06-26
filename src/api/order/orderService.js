import { httpClient } from "../common/httpClient";

export const orderService = {
  getOrders(params) {
    return httpClient.get("/api/orders", { params });
  },

  getOrder(orderId) {
    return httpClient.get(`/api/orders/${orderId}`);
  },

  updateOrderStatus(orderId, payload) {
    return httpClient.patch(`/api/orders/${orderId}/status`, payload);
  },

  cancelOrder(orderId, payload) {
    return httpClient.post(`/api/orders/${orderId}/cancel`, payload);
  },
};
