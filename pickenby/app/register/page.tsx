import type { Metadata } from "next";
import { AuthRegisterForm } from "@/components/AuthRegisterForm";

export const metadata: Metadata = { title: "Create an account — Pickenby" };

export default function RegisterPage() {
  return (
    <main className="pb-16">
      <div className="container-page">
        <div className="mx-auto w-full max-w-md py-10">
          <AuthRegisterForm />
        </div>
      </div>
    </main>
  );
}