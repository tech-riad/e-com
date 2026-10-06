import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset password — Pickenby" };

export default function ForgotPasswordPage() {
  return (
    <main className="pb-16">
      <div className="container-page">
        <div className="mx-auto w-full max-w-md py-10">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}