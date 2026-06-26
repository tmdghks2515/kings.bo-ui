import { httpClient } from "../httpClient";

export const memberService = {
  getMembers(params) {
    return httpClient.get("/api/members", { params });
  },

  getMember(memberId) {
    return httpClient.get(`/api/members/${memberId}`);
  },

  updateMember(memberId, payload) {
    return httpClient.patch(`/api/members/${memberId}`, payload);
  },

  updateMemberStatus(memberId, payload) {
    return httpClient.patch(`/api/members/${memberId}/status`, payload);
  },
};
