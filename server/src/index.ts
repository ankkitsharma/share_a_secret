import { Hono } from "hono";
import { getDb } from "./db";
import { secretsTable } from "./db/schema";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";

type Env = {
  DATABASE_URL: string;
  db: ReturnType<typeof getDb>;
};

const app = new Hono<{ Bindings: Env }>();

app.onError((err, c) => {
  if (err instanceof HTTPException) {
     // Log the HTTPException error
        console.log('HTTPException', err);
        // Return the custom response from the exception
        return c.json({ error: err.message }, err.status); // Ensure a valid response is returned
  }

  if (err instanceof Error) {
        // Log the general error
        console.log('Error', err);
        // Return a text response with the error message and a 500 status code
        return c.text(`Error: ${err.message}`, 500); // Ensure a valid response is returned
    }
  console.error(`${err}`)
  // Fallback response for unknown errors
  return c.text('An unknown error occurred', 500);
})

// Middleware to initialize the database connection
app.use("*", async (c, next) => {
  if (!c.env.db) {
    c.env.db = getDb(c.env.DATABASE_URL);
    console.log("Database connection initialized");
  }
  await next();
});

app.use("apiv1/*", cors());

async function testConnection(c: Env) {
  await c.db.execute("SELECT NOW()")
    .then((result) => {
      console.log("Current time from database:", result.rows[0]);
    })
    .catch((error) => {
      console.error("Error executing time query:", error);
    });
}

app.get("/", async (c) => {
  //test connection
  await testConnection(c.env);

  return c.json({
    ok: true,
    message: "Hello Hono!",
  });
});

app.get("/apiv1/health", async (c) => {
  return c.json({
    ok: true,
    message: "API is healthy",
  });
});

app.get("/apiv1/secrets", async (c) => {
  const secrets = await c.env.db.select().from(secretsTable);
  return c.json(secrets);
});

app.get("/apiv1/secrets/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (isNaN(id)) {
    return c.json({ error: "Invalid ID format" }, 400);
  }
  const secret = await c.env.db
    .select()
    .from(secretsTable)
    .where(eq(secretsTable.id, id))
    .limit(1);
  if (secret.length === 0) {
    return c.json({ error: "Secret not found" }, 404);
  }
  return c.json(secret[0]);
});

export default app;
