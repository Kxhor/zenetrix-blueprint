import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, type AuthUser } from "@/lib/api-client";
import type { AxiosResponse } from "axios";

export type Role = "user" | "admin";

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loginUser: (
    phone: string,
  ) => Promise<AxiosResponse<{ success: boolean; expiresIn: number; _devCode?: string }>>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  register: (phone: string, name?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      loginUser: async (phone) => {
        return authApi.sendOtp(phone);
      },

      verifyOtp: async (phone, code) => {
        const { data } = await authApi.verifyOtp(phone, code);
        authApi.setToken(data.token);
        set({ user: data.user, token: data.token });
      },

      loginAdmin: async (email, password) => {
        const { data } = await authApi.adminLogin(email, password);
        authApi.setToken(data.token);
        set({ user: data.user, token: data.token });
      },

      register: async (phone, name) => {
        const { data } = await authApi.register(phone, name);
        authApi.setToken(data.token);
        set({ user: data.user, token: data.token });
      },

      logout: () => {
        authApi.logout();
        set({ user: null, token: null });
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
    }),
    {
      name: "zenetrix.auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);
