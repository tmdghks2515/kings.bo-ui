import { httpClient } from "../httpClient";

export const displayService = {
  getDisplays(params) {
    return httpClient.get("/api/displays", { params });
  },

  getDisplay(displayId) {
    return httpClient.get(`/api/displays/${displayId}`);
  },

  createDisplay(payload) {
    return httpClient.post("/api/displays", payload);
  },

  updateDisplay(displayId, payload) {
    return httpClient.put(`/api/displays/${displayId}`, payload);
  },

  deleteDisplay(displayId) {
    return httpClient.delete(`/api/displays/${displayId}`);
  },
};
