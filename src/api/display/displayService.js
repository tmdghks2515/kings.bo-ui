import { httpClient } from "../httpClient";

export const displayService = {
  getDisplays(params) {
    return httpClient.get("/api/curation-pages", { params });
  },

  getCurationPage(curationPageId) {
    return httpClient.get(`/api/curation-pages/${curationPageId}`);
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

  updateCurationSortOrders(payload) {
    return httpClient.put("/api/curations/sort-orders", payload);
  },

  deleteDisplay(displayId) {
    return httpClient.delete(`/api/curations/${displayId}`);
  },
};
