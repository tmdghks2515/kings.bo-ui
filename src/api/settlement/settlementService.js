import { httpClient } from "../httpClient";

export const settlementService = {
  getSettlements(params) {
    return httpClient.get("/api/settlements", { params });
  },

  getSettlement(settlementId) {
    return httpClient.get(`/api/settlements/${settlementId}`);
  },

  confirmSettlement(settlementId) {
    return httpClient.post(`/api/settlements/${settlementId}/confirm`);
  },

  exportSettlements(params) {
    return httpClient.get("/api/settlements/export", { params });
  },
};
