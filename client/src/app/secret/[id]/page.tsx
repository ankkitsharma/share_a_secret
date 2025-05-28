"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = "http://localhost:8787/apiv1";

export default function ViewSecret() {
  const params = useParams();
  const [secret, setSecret] = useState<string | null>(null);
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresPasscode, setRequiresPasscode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const markAsViewed = async () => {
    try {
      await fetch(`${API_URL}/secrets/${params.id}/viewed`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Error marking secret as viewed:", err);
    }
  };

  const fetchSecret = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/secrets/${params.id}`, {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && data.error === "Passcode required") {
          setRequiresPasscode(true);
          return;
        }
        throw new Error(data.error || "Failed to fetch secret");
      }

      setSecret(data.secret);
      if (data.oneTime) {
        // Mark as viewed after displaying
        await markAsViewed();
      }
    } catch (err) {
      console.error("Error fetching secret:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch secret");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerified) return; // Prevent multiple verifications

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/secrets/${params.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify passcode");
      }

      setSecret(data.secret);
      setIsVerified(true);
      if (data.oneTime) {
        // Mark as viewed after displaying
        await markAsViewed();
      }
    } catch (err) {
      console.error("Error verifying passcode:", err);
      setError(
        err instanceof Error ? err.message : "Failed to verify passcode"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecret();
  }, [params.id]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (requiresPasscode && !isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Passcode Required</CardTitle>
          <CardDescription>
            This secret is protected by a passcode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={verifyPasscode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passcode">Enter Passcode</Label>
              <Input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter the passcode..."
                required
                disabled={isVerified}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isVerified}
            >
              {isLoading
                ? "Verifying..."
                : isVerified
                ? "Verified"
                : "View Secret"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (!secret) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Fetching your secret...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Secret</CardTitle>
        <CardDescription>
          {isVerified
            ? "This secret has been viewed and deleted."
            : "Here's your secret message:"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {secret && (
          <div className="p-4 bg-muted rounded-lg font-mono break-all">
            {secret}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
