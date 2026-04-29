import { cn } from "@/lib/utils";

/**
 * Decorative gradient mesh background. Use behind hero sections or premium cards.
 * Pure CSS, GPU-friendly, no images.
 */
export function GradientMesh({
  className,
  intensity = "default",
}: {
  className?: string;
  intensity?: "soft" | "default" | "strong";
}) {
  const opacity =
    intensity === "soft" ? "opacity-50" : intensity === "strong" ? "opacity-90" : "opacity-70";
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 gradient-mesh", opacity, className)}
    />
  );
}
