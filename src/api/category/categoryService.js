import { httpClient } from "../common/httpClient";

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

  deleteCategory(categoryId) {
    return httpClient.delete(`/api/product-categories/${categoryId}`);
  },

  deleteCategories(categoryIds) {
    return Promise.all(
      categoryIds.map((categoryId) =>
        httpClient.delete(`/api/product-categories/${categoryId}`),
      ),
    );
  },
};
