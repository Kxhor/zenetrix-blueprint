import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ZenetrixWordmark } from "@/components/brand";
import { GradientMesh } from "@/components/gradient-mesh";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("neha.patel@zenetrix.in");
  const [password, setPassword] = useState("demo-pass");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loginAdmin = useAuthStore((s) => s.loginAdmin);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter email and password");
      return;
    }
    setLoading(true);
    try {
      await loginAdmin(email, password);
      toast.success("Welcome back, analyst");
      navigate({ to: "/admin/dashboard" });
    } catch {
      toast.error("Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-muted/30">
      <GradientMesh intensity="soft" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-8 md:grid-cols-2 md:gap-16 md:py-12">
        <div className="hidden md:flex md:flex-col md:justify-between">
          <ZenetrixWordmark />
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Lock className="h-3 w-3" /> Analyst Console · v3.2
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight">
              Sign in to review
              <br />
              verified identities.
            </h1>
            <p className="mt-3 max-w-sm text-muted-foreground">
              Triage sessions, decide on cases and export audit-ready logs — all in one place.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            By signing in you agree to the Zenetrix analyst handbook & DPDP guidelines.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border bg-card p-6 shadow-elegant sm:p-8"
        >
          <div className="mb-6 flex items-center justify-between md:hidden">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
            <ZenetrixWordmark />
            <span className="w-12" />
          </div>

          <h2 className="font-display text-2xl font-semibold tracking-tight">Analyst sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Demo credentials are pre-filled. Any value will sign you in.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd">Password</Label>
              <div className="relative">
                <Input
                  id="pwd"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="h-11 w-full rounded-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Need access? Contact your <span className="text-foreground">compliance lead</span>.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
