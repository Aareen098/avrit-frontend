import { create } from "zustand";
import { persist } from "zustand/middleware";

// Keeps the logged-in user and token. Saved in localStorage so a refresh keeps you logged in.
export const useAuthStore = create()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => set({ token, user }),
      updateUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "avrit-auth" }
  )
);
