import { Metadata } from "next";
import { CreateSecretForm } from "@/components/create-secret-form";

export const metadata: Metadata = {
  title: "Share a Secret - Secure Secret Sharing",
  description:
    "Share secrets securely with one-time access and automatic expiration",
};

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      <div className="space-y-8">
        <div className="text-center space-y-3 animate-subtle-pulse">
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Share a Secret
          </h1>
          <p className="text-lg text-muted-foreground">
            Share sensitive information securely with one-time access and
            automatic expiration
          </p>
        </div>

        <div className="glass-card rounded-xl p-8 card-hover">
          <CreateSecretForm />
        </div>
      </div>
    </main>
  );
}
