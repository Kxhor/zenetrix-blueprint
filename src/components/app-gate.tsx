import { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";

/**
 * Applies global UI preferences (high contrast, text scale) and renders children.
 */
export function AppGate({ children }: { children: React.ReactNode }) {
  const highContrast = useUiStore((s) => s.highContrast);
  const textScale = useUiStore((s) => s.textScale);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("contrast-more", highContrast);
    root.style.fontSize = textScale === "large" ? "17px" : "16px";
  }, [highContrast, textScale]);

  return <>{children}</>;
}
