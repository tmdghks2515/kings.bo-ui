import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { decodeJwtPayload, isJwtExpired } from "@/utils/jwt";

const createUserFromToken = (accessToken) => {
  const payload = decodeJwtPayload(accessToken);

  if (!payload || isJwtExpired(payload)) {
    return null;
  }

  return {
    username: payload.sub,
    roles: payload.roles ?? [],
    issuedAt: payload.iat,
    expiresAt: payload.exp,
  };
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      tokenType: "Bearer",
      user: null,
      setAuth: ({ accessToken, tokenType = "Bearer" }) => {
        set({
          accessToken,
          tokenType,
          user: createUserFromToken(accessToken),
        });
      },
      clearAuth: () => {
        set({
          accessToken: null,
          tokenType: "Bearer",
          user: null,
        });
      },
      restoreUserFromToken: () => {
        set((state) => ({
          user: createUserFromToken(state.accessToken),
        }));
      },
      validateAuth: () => {
        const user = createUserFromToken(get().accessToken);

        if (!user) {
          set({
            accessToken: null,
            tokenType: "Bearer",
            user: null,
          });
          return false;
        }

        set({ user });
        return true;
      },
    }),
    {
      name: "kings.bo.auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        tokenType: state.tokenType,
        user: state.user,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
