"use client";

import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <AuthCard>
      <ForgotPasswordForm onBack={() => router.push("/login")} />
    </AuthCard>
  );
}
