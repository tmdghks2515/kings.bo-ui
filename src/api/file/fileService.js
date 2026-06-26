import { httpClient } from "../httpClient";

export const fileService = {
  uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    return httpClient.post("/api/files", formData);
  },
};
