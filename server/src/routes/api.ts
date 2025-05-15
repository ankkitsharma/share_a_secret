import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { describeRoute } from "hono-openapi";
import * as z from "zod";
import { Env } from "../types";
import { getHealth, getSecrets, getSecretById } from "../handlers/api";

// Validation schemas
const secretIdSchema = z.object({
  id: z.string(),
});

// Create a typed route group
const secrets = new Hono<{ Bindings: Env }>().get(
  "/:id",
  describeRoute({
    tags: ["Secrets"],
    summary: "Get a secret by ID",
    description: "Retrieves a specific secret by its ID",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
        description: "The ID of the secret to retrieve",
      },
    ],
    responses: {
      200: {
        description: "Secret found",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "number" },
                content: { type: "string" },
                created_at: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      404: {
        description: "Secret not found",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: { type: "string" },
              },
            },
          },
        },
      },
    },
  }),
  zValidator("param", secretIdSchema),
  getSecretById
);

export const apiV1App = new Hono<{ Bindings: Env }>()
  .use("*", cors())
  .get(
    "/health",
    describeRoute({
      tags: ["Health"],
      summary: "Check API health",
      description: "Returns the health status of the API",
      responses: {
        200: {
          description: "API is healthy",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ok: { type: "boolean" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    }),
    getHealth
  )
  .get(
    "/secrets",
    describeRoute({
      tags: ["Secrets"],
      summary: "List all secrets",
      description: "Retrieves a list of all secrets stored in the database",
      responses: {
        200: {
          description: "List of secrets",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    content: { type: "string" },
                    created_at: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    }),
    getSecrets
  )
  .route("/secrets", secrets);
