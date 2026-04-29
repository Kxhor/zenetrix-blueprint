import { create } from "zustand";

export type OnboardingStep = "start" | "identity" | "liveness" | "review" | "success";

export interface IdentityDraft {
  fullName: string;
  dob: string;
  aadhaar: string;
  pan: string;
  address: string;
  documentName?: string;
  documentPreview?: string; // object URL
}

interface OnboardingState {
  step: OnboardingStep;
  identity: Partial<IdentityDraft>;
  livenessScore: number | null;
  setStep: (s: OnboardingStep) => void;
  setIdentity: (i: Partial<IdentityDraft>) => void;
  setLivenessScore: (n: number) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: "start",
  identity: {},
  livenessScore: null,
  setStep: (step) => set({ step }),
  setIdentity: (i) => set((s) => ({ identity: { ...s.identity, ...i } })),
  setLivenessScore: (n) => set({ livenessScore: n }),
  reset: () => set({ step: "start", identity: {}, livenessScore: null }),
}));
