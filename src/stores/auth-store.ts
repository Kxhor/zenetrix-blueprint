import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "user" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: Role;
  avatarColor: string;
}

interface AuthState {
  user: AuthUser | null;
  loginUser: (phone: string) => void;
  loginAdmin: (email: string) => void;
  logout: () => void;
}

const colors = ["#0EA5E9", "#16A34A", "#7C3AED", "#F59E0B", "#EC4899"];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loginUser: (phone) =>
        set({
          user: {
            id: "u_" + Math.random().toString(36).slice(2, 10),
            name: "Aarav Sharma",
            phone,
            role: "user",
            avatarColor: colors[Math.floor(Math.random() * colors.length)],
          },
        }),
      loginAdmin: (email) =>
        set({
          user: {
            id: "a_" + Math.random().toString(36).slice(2, 10),
            name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            email,
            role: "admin",
            avatarColor: colors[0],
          },
        }),
      logout: () => set({ user: null }),
    }),
    { name: "zenetrix.auth" },
  ),
);
