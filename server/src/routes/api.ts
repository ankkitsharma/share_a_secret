import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import {
  getHealthDesc,
  getSecretByIdDesc,
  getSecretsDesc,
} from "@/types/swagger";
import * as z from "zod";
import { Env } from "@/types";
import { getHealth, getSecrets, getSecretById } from "@/handlers/api";

// Validation schemas
const secretIdSchema = z.object({
  id: z.string(),
});

// Create a typed route group
const secrets = new Hono<{ Bindings: Env }>()
  .get("/", getSecretsDesc, getSecrets)
  .get(
    "/:id",
    getSecretByIdDesc,
    zValidator("param", secretIdSchema),
    getSecretById
  );

export const apiV1App = new Hono<{ Bindings: Env }>()
  .use("*", cors())
  .get("/health", getHealthDesc, getHealth)
  .route("/secrets", secrets);
