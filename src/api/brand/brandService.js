import { httpClient } from "../httpClient";

export const brandService = {
  getBrands() {
    return httpClient.get("/api/brands");
  },

  getBrand(brandId) {
    return httpClient.get(`/api/brands/${brandId}`);
  },

  createBrand(payload) {
    return httpClient.post("/api/brands", payload);
  },

  updateBrand(brandId, payload) {
    return httpClient.put(`/api/brands/${brandId}`, payload);
  },

  deleteBrand(brandId) {
    return httpClient.delete(`/api/brands/${brandId}`);
  },
};
