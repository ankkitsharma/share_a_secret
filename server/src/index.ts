import { Hono } from "hono";
import { getDb } from "./db";
import { secretsTable } from "./db/schema";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

type Env = {
  DATABASE_URL: string;
  db: ReturnType<typeof getDb>;
};

// Create API v1 routes using chaining
const apiV1App = new Hono<{ Bindings: Env }>()
  .use("*", cors())
  .get("/health", async (c) => {
    return c.json({
      ok: true,
      message: "API is healthy",
    });
  })
  .get("/secrets", async (c) => {
    const secrets = await c.env.db.select().from(secretsTable);
    return c.json(secrets);
  })
  .get(
    "/secrets/:id",
    zValidator(
      "param",
      z.object({
        id: z.number(),
      })
    ),
    async (c) => {
      const id = c.req.valid("param").id;
      // No need to check for NaN as validation ensures it's a valid number
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
const app = new Hono<{ Bindings: Env }>()
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
  .get("/sum", (c) => {
    const sum = 1 + 1;
    return c.json({ sum });
  })
  .get("/", async (c) => {
    await testConnection(c.env);
    return c.json({
      ok: true,
      message: "Hello Hono!",
    });
  });

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
