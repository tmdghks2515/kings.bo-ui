import { httpClient } from "../httpClient";

export const categoryService = {
  getCategories(params) {
    return httpClient.get("/api/product-categories", { params });
  },

  getCategory(categoryId) {
    return httpClient.get(`/api/product-categories/${categoryId}`);
  },

  createCategory(payload) {
    return httpClient.post("/api/product-categories", payload);
  },

  updateCategory(categoryId, payload) {
    return httpClient.put(`/api/product-categories/${categoryId}`, payload);
  },

  deleteCategories(categoryIds) {
    return httpClient.post("/api/product-categories/delete", {
      categoryIds,
    });
  },
};
