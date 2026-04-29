import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ZenetrixWordmark } from "@/components/brand";
import { GradientMesh } from "@/components/gradient-mesh";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return <PhoneOtpAuth mode="login" />;
}

export function PhoneOtpAuth({ mode }: { mode: "login" | "register" }) {
  const [phase, setPhase] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [resendIn, setResendIn] = useState(0);
  const navigate = useNavigate();
  const loginUser = useAuthStore((s) => s.loginUser);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    setPhase("otp");
    setResendIn(30);
    toast.success("OTP sent", { description: "Use any 6-digit code in this demo." });
    setTimeout(() => inputs.current[0]?.focus(), 50);
  }

  function handleOtpChange(idx: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) inputs.current[idx + 1]?.focus();
    if (next.every((d) => d) && next.join("").length === 6) {
      submitOtp(next.join(""));
    }
  }

  function submitOtp(code: string) {
    if (code.length < 6) return;
    loginUser("+91 " + phone);
    toast.success(mode === "register" ? "Welcome to Zenetrix" : "Welcome back");
    navigate({ to: mode === "register" ? "/onboarding/start" : "/wallet" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GradientMesh intensity="soft" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
        <header className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>
          <ZenetrixWordmark />
          <span className="w-12" />
        </header>

        <main className="flex flex-1 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-success" />
              {mode === "register" ? "Create your wallet" : "Sign in to your wallet"}
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {phase === "phone" ? "Enter your number" : "Enter the OTP"}
            </h1>
            <p className="text-muted-foreground">
              {phase === "phone"
                ? "We'll send a one-time code to verify your phone."
                : `We've sent a 6-digit code to +91 ${phone}.`}
            </p>
          </motion.div>

          {phase === "phone" ? (
            <form onSubmit={sendOtp} className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm font-mono">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    placeholder="98765 43210"
                    className="rounded-l-none font-mono tracking-wider"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                </div>
              </div>
              <Button type="submit" className="h-11 w-full rounded-full text-base">
                Send OTP <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {mode === "login" ? "New to Zenetrix?" : "Already have an account?"}{" "}
                <Link
                  to={mode === "login" ? "/register" : "/login"}
                  className="font-medium text-accent hover:underline"
                >
                  {mode === "login" ? "Create an account" : "Sign in"}
                </Link>
              </p>
            </form>
          ) : (
            <div className="mt-8 space-y-4">
              <div className="flex justify-between gap-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
                    }}
                    className="h-14 w-full rounded-xl border bg-card text-center font-mono text-xl font-semibold tabular-nums shadow-sm outline-none ring-accent transition focus:ring-2"
                  />
                ))}
              </div>
              <Button
                onClick={() => submitOtp(otp.join(""))}
                className="h-11 w-full rounded-full text-base"
                disabled={otp.join("").length < 6}
              >
                Verify
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setPhase("phone")}
                >
                  Change number
                </button>
                <button
                  disabled={resendIn > 0}
                  onClick={() => {
                    setResendIn(30);
                    toast.success("OTP resent");
                  }}
                  className="font-medium text-accent disabled:text-muted-foreground"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="pt-6 text-center text-xs text-muted-foreground">
          Protected by bank-grade encryption. Your data never leaves your device unencrypted.
        </footer>
      </div>
    </div>
  );
}
