import { Hono } from "hono";
import { getDb } from "./db";
import { secretsTable } from "./db/schema";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import { describeRoute } from "hono-openapi";
import { openAPISpecs } from "hono-openapi";
import { swaggerUI } from "@hono/swagger-ui";

type Env = {
  DATABASE_URL: string;
  db: ReturnType<typeof getDb>;
};

// Create API v1 routes using chaining
const apiV1App = new Hono<{ Bindings: Env }>()
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
    async (c) => {
      return c.json({
        ok: true,
        message: "API is healthy",
      });
    }
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
    async (c) => {
      const secrets = await c.env.db.select().from(secretsTable);
      return c.json(secrets);
    }
  )
  .get(
    "/secrets/:id",
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
            type: "number",
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
    zValidator(
      "param",
      z.object({
        id: z.number(),
      })
    ),
    async (c) => {
      const id = c.req.valid("param").id;
      const secret = await c.env.db
        .select()
        .from(secretsTable)
        .where(eq(secretsTable.id, id))
        .limit(1);
      if (secret.length === 0) {
        return c.json({ error: "Secret not found" }, 404);
      }
      return c.json(secret[0]);
    }
  );

// Create main app with all routes using chaining
let app = new Hono<{ Bindings: Env }>()
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      // Log the HTTPException error
      console.log("HTTPException", err);
      // Return the custom response from the exception
      return c.json({ error: err.message }, err.status);
    }

    if (err instanceof Error) {
      // Log the general error
      console.log("Error", err);
      // Return a text response with the error message and a 500 status code
      return c.text(`Error: ${err.message}`, 500);
    }
    console.error(`${err}`);
    // Fallback response for unknown errors
    return c.text("An unknown error occurred", 500);
  })
  .use("*", async (c, next) => {
    if (!c.env.db) {
      c.env.db = getDb(c.env.DATABASE_URL);
      console.log("Database connection initialized");
    }
    await next();
  })
  .route("/apiv1", apiV1App)
  .get(
    "/sum",
    describeRoute({
      tags: ["Math"],
      summary: "Calculate sum",
      description: "Returns the sum of 1 + 1",
      responses: {
        200: {
          description: "Sum calculated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sum: { type: "number" },
                },
              },
            },
          },
        },
      },
    }),
    (c) => {
      const sum = 1 + 1;
      return c.json({ sum });
    }
  )
  .get(
    "/",
    describeRoute({
      tags: ["Health"],
      summary: "Root endpoint",
      description: "Returns a greeting message and tests database connection",
      responses: {
        200: {
          description: "Greeting message",
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
    async (c) => {
      await testConnection(c.env);
      return c.json({
        ok: true,
        message: "Hello Hono!",
      });
    }
  );

// Add OpenAPI specification endpoint and Swagger UI
app = app
  .get(
    "/openapi",
    openAPISpecs(app, {
      documentation: {
        info: {
          title: "Share a Secret API",
          version: "1.0.0",
          description: "API for sharing and retrieving secrets",
        },
        servers: [
          { url: "http://localhost:8787", description: "Local Server" },
        ],
      },
    })
  )
  .get("/swagger", swaggerUI({ url: "/openapi" }));

async function testConnection(c: Env) {
  await c.db
    .execute("SELECT NOW()")
    .then((result) => {
      console.log("Current time from database:", result.rows[0]);
    })
    .catch((error) => {
      console.error("Error executing time query:", error);
    });
}

export type ApiV1Type = typeof apiV1App;
export default app;
