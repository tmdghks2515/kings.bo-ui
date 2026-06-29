import { httpClient } from "../httpClient";

export const displayService = {
  getDisplays(params) {
    return httpClient.get("/api/curations", { params });
  },

  getDisplay(displayId) {
    return httpClient.get(`/api/curations/${displayId}`);
  },

  createDisplay(payload) {
    return httpClient.post("/api/curations", payload);
  },

  updateDisplay(displayId, payload) {
    return httpClient.put(`/api/curations/${displayId}`, payload);
  },

  deleteDisplay(displayId) {
    return httpClient.delete(`/api/curations/${displayId}`);
  },
};
