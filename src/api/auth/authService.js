import { httpClient } from "../httpClient";

export const authService = {
  login(payload) {
    return httpClient.post("/api/auth/login", payload);
  },

  logout() {
    return httpClient.post("/api/auth/logout");
  },

  getMe() {
    return httpClient.get("/api/auth/me");
  },

  refreshToken() {
    return httpClient.post("/api/auth/refresh");
  },
};
