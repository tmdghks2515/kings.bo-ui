import { httpClient } from "../httpClient";

export const userService = {
  createUser(payload) {
    return httpClient.post("/api/users", payload);
  },
};
