import { httpClient } from "../common/httpClient";

export const productService = {
  getProducts(params) {
    return httpClient.get("/api/products", { params });
  },

  getProduct(productId) {
    return httpClient.get(`/api/products/${productId}`);
  },

  createProduct(payload) {
    return httpClient.post("/api/products", payload);
  },

  updateProduct(productId, payload) {
    return httpClient.put(`/api/products/${productId}`, payload);
  },

  deleteProduct(productId) {
    return httpClient.delete(`/api/products/${productId}`);
  },

  deleteProducts(productIds) {
    return httpClient.post("/api/products/bulk-delete", { productIds });
  },
};
