import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarCollapsed: boolean;
  language: "en" | "hi" | "ta";
  highContrast: boolean;
  textScale: "normal" | "large";
  toggleSidebar: () => void;
  setLanguage: (l: UiState["language"]) => void;
  setHighContrast: (v: boolean) => void;
  setTextScale: (v: UiState["textScale"]) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      language: "en",
      highContrast: false,
      textScale: "normal",
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setLanguage: (language) => set({ language }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setTextScale: (textScale) => set({ textScale }),
    }),
    { name: "zenetrix.ui" },
  ),
);
