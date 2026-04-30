import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, CheckCircle2, Camera, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { useOnboardingStore } from "@/stores/onboarding-store";

export const Route = createFileRoute("/_wallet/onboarding/liveness")({
  component: OnboardingLiveness,
});

const prompts = [
  "Look straight at the camera",
  "Slowly blink your eyes",
  "Turn your head left, then right",
];

function OnboardingLiveness() {
  const navigate = useNavigate();
  const setLiveness = useOnboardingStore((s) => s.setLivenessScore);
  const [phase, setPhase] = useState<"intro" | "running" | "done">("intro");
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (phase !== "running") return;
    let raf = 0;
    const start = performance.now();
    const total = 4500;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / total);
      setProgress(p);
      const s = Math.min(2, Math.floor(p * 3));
      setStep(s);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        captureImage();
        setPhase("done");
        setLiveness(96);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, setLiveness]);

  useEffect(() => {
    if (phase === "running") {
      startCamera();
    }
    return () => stopCamera();
  }, [phase]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        setCapturedImage(dataUrl);
      }
    }
    stopCamera();
  };

  const retake = () => {
    setCapturedImage(null);
    setPhase("intro");
    setProgress(0);
    setStep(0);
  };

  return (
    <div className="pb-12">
      <OnboardingProgress current="liveness" back="/onboarding/identity" />
      <div className="px-5 pt-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Liveness check</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll capture a short clip — no recording is stored.
        </p>

        <div className="mt-6 flex flex-col items-center">
          <div className="relative flex h-64 w-64 items-center justify-center">
            {/* Ring */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="oklch(0.92 0.008 250)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="oklch(0.7 0.14 230)"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - progress)}
                strokeLinecap="round"
                className="transition-[stroke-dashoffset] duration-200"
              />
            </svg>

            {/* Camera / Captured Image */}
            {phase === "done" && capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="h-44 w-44 rounded-full object-cover"
              />
            ) : phase === "running" ? (
              <div className="relative h-44 w-44 overflow-hidden rounded-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-muted to-card">
                <ScanFace className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          <div className="mt-6 h-12 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${phase}-${step}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-base font-medium"
              >
                {phase === "intro"
                  ? "Hold your phone at eye level"
                  : phase === "done"
                    ? "Liveness passed · 96% confidence"
                    : prompts[step]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-6 w-full">
            {phase === "intro" && (
              <Button
                size="lg"
                className="h-12 w-full rounded-full text-base"
                onClick={() => setPhase("running")}
              >
                <Camera className="mr-2 h-5 w-5" />
                Start liveness
              </Button>
            )}
            {phase === "running" && (
              <Button size="lg" disabled className="h-12 w-full rounded-full text-base">
                Capturing… {Math.round(progress * 100)}%
              </Button>
            )}
            {phase === "done" && (
              <div className="space-y-3">
                <div className="rounded-lg bg-success/10 p-4 text-center">
                  <p className="text-sm font-medium text-success">Mock Result: PASSED</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Liveness Score: 96% | Spoof Check: Passed | Face Match: Verified
                  </p>
                </div>
                {capturedImage && (
                  <div className="rounded-lg border p-2">
                    <p className="text-xs text-muted-foreground mb-2">Captured Image Output:</p>
                    <img src={capturedImage} alt="Captured" className="w-full rounded" />
                  </div>
                )}
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 flex-1 rounded-full text-base"
                    onClick={retake}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retake
                  </Button>
                  <Button
                    size="lg"
                    className="h-12 flex-1 rounded-full text-base"
                    onClick={() => navigate({ to: "/onboarding/review" })}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
