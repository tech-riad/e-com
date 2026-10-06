import type { Metadata } from "next";
import { AccountPanel } from "@/components/AccountPanel";

export const metadata: Metadata = { title: "My account — Pickenby" };

export default function AccountPage() {
  return (
    <main className="pb-16">
      <div className="container-page">
        <div className="mx-auto w-full max-w-md py-10">
          <AccountPanel />
        </div>
      </div>
    </main>
  );
}