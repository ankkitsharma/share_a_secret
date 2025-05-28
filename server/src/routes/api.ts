import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import {
  getHealthDesc,
  getSecretByIdDesc,
  getSecretsDesc,
  createSecretDesc,
  updateSecretDesc,
  verifySecretPasscodeDesc,
  markSecretAsViewedDesc,
} from "@/types/swagger";
import * as z from "zod";
import { Env } from "@/types";
import {
  getHealth,
  getSecrets,
  getSecretById,
  createSecret,
  updateSecret,
  verifySecretPasscode,
  markSecretAsViewed,
} from "@/handlers/api";

// Validation schemas
const secretIdSchema = z.object({
  id: z.string(),
});

const createSecretSchema = z.object({
  secret: z.string(),
  passcode: z.string().optional(),
  destroyAfter: z.string().optional(),
  oneTime: z.boolean().optional(),
});

const updateSecretSchema = z.object({
  secret: z.string().optional(),
  passcode: z.string().optional(),
  destroyAfter: z.string().optional(),
  oneTime: z.boolean().optional(),
});

const verifyPasscodeSchema = z.object({
  passcode: z.string(),
});

// Create a typed route group
const secrets = new Hono<{ Bindings: Env }>()
  .get("/", getSecretsDesc, getSecrets)
  .get(
    "/:id",
    getSecretByIdDesc,
    zValidator("param", secretIdSchema),
    getSecretById
  )
  .post(
    "/:id/verify",
    verifySecretPasscodeDesc,
    zValidator("param", secretIdSchema),
    zValidator("json", verifyPasscodeSchema),
    verifySecretPasscode
  )
  .post(
    "/:id/viewed",
    markSecretAsViewedDesc,
    zValidator("param", secretIdSchema),
    markSecretAsViewed
  )
  .post(
    "/",
    createSecretDesc,
    zValidator("json", createSecretSchema),
    createSecret
  )
  .put(
    "/:id",
    updateSecretDesc,
    zValidator("param", secretIdSchema),
    zValidator("json", updateSecretSchema),
    updateSecret
  );

export const apiV1App = new Hono<{ Bindings: Env }>()
  .use("*", cors())
  .get("/health", getHealthDesc, getHealth)
  .route("/secrets", secrets);
