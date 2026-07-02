import { httpClient } from "../httpClient";

export const userService = {
  getUsers() {
    return httpClient.get("/api/users");
  },

  getUser(username) {
    return httpClient.get(`/api/users/${encodeURIComponent(username)}`);
  },

  createUser(payload) {
    return httpClient.post("/api/users", payload);
  },

  updateUser(username, payload) {
    return httpClient.put(`/api/users/${encodeURIComponent(username)}`, payload);
  },

  deleteUsers(usernames) {
    return httpClient.post("/api/users/bulk-delete", { usernames });
  },
};
