import { Metadata } from "next";
import { CreateSecretForm } from "@/components/create-secret-form";

export const metadata: Metadata = {
  title: "Share a Secret - Secure Secret Sharing",
  description:
    "Share secrets securely with one-time access and automatic expiration",
};

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Share a Secret</h1>
          <p className="text-muted-foreground">
            Share sensitive information securely with one-time access and
            automatic expiration
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <CreateSecretForm />
        </div>
      </div>
    </main>
  );
}
