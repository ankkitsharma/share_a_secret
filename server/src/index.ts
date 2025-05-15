import { Hono } from "hono";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getDb } from "./db";
import { usersTable } from "./db/schema";

type Env = {
  DATABASE_URL: string;
  db: ReturnType<typeof getDb>;
};

const app = new Hono<{ Bindings: Env }>();

// Middleware to initialize the database connection
app.use("*", async (c, next) => {
  if (!c.env.db) {
    c.env.db = getDb(c.env.DATABASE_URL);
  }
  await next();
});

// Healthcheck route that doesn't require database access
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "share-a-secret-api",
  });
});
// 1+ 1=
app.get("/sum", (c) => {
  const sum = 1 + 1;
  return c.json({ sum });
});

app.get("/", async (c) => {
  //test connection
  await c.env.db
    .select()
    .from(usersTable)
    .then((result) => {
      console.log("Connection test result:", result);
    })
    .catch((error) => {
      console.error("Error connecting to the database:", error);
    });

  return c.json({
    ok: true,
    message: "Hello Hono!",
  });
});

export default app;
