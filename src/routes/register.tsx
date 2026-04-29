import { createFileRoute } from "@tanstack/react-router";
import { PhoneOtpAuth } from "./login";

export const Route = createFileRoute("/register")({
  component: () => <PhoneOtpAuth mode="register" />,
});
