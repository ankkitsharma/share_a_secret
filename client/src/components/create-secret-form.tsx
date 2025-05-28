"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_URL = "http://localhost:8787/apiv1";

export function CreateSecretForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [secret, setSecret] = useState("");
  const [passcode, setPasscode] = useState("");
  const [oneTime, setOneTime] = useState(true);
  const [expiration, setExpiration] = useState("24h");
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/secrets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          passcode: passcode || undefined,
          oneTime,
          expiration: getExpirationTime(expiration),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create secret");
      }

      const data = await response.json();
      setCreatedUrl(data.url);
      toast.success("Secret created successfully", {
        description: "Share this URL with the recipient.",
      });
    } catch (err) {
      console.error("Error creating secret:", err);
      toast.error("Failed to create secret", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getExpirationTime = (expiration: string) => {
    const now = new Date();
    switch (expiration) {
      case "1h":
        return new Date(now.getTime() + 60 * 60 * 1000);
      case "24h":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "7d":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  };

  if (createdUrl) {
    const fullUrl = `${window.location.origin}${createdUrl}`;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Secret Created!</CardTitle>
          <CardDescription>
            Share this URL with the recipient.{" "}
            {oneTime ? "This secret can only be viewed once." : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono break-all">
            {fullUrl}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(fullUrl);
              toast.success("URL copied to clipboard");
            }}
          >
            Copy URL
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setCreatedUrl(null);
              setSecret("");
            }}
          >
            Create Another Secret
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="secret">Your Secret</Label>
          <Textarea
            id="secret"
            placeholder="Enter the secret you want to share..."
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passcode">Passcode (Optional)</Label>
          <Input
            id="passcode"
            type="password"
            placeholder="Enter a passcode to protect this secret..."
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            If set, recipients will need this passcode to view the secret.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="one-time"
            checked={oneTime}
            onCheckedChange={setOneTime}
          />
          <Label htmlFor="one-time">One-time access only</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiration">Expiration</Label>
          <Select value={expiration} onValueChange={setExpiration}>
            <SelectTrigger>
              <SelectValue placeholder="Select expiration time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Secret"}
      </Button>
    </form>
  );
}
