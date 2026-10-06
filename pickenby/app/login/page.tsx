import type { Metadata } from "next";
import { AuthLoginForm } from "@/components/AuthLoginForm";

export const metadata: Metadata = { title: "Sign in — Pickenby" };

export default function LoginPage() {
  return (
    <main className="pb-16">
      <div className="container-page">
        <div className="mx-auto w-full max-w-md py-10">
          <AuthLoginForm />
        </div>
      </div>
    </main>
  );
}