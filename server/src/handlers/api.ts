import { Context } from "hono";
import { eq } from "drizzle-orm";
import { secretsTable } from "../db/schema";
import { Env } from "../types";

export async function getHealth(c: Context<{ Bindings: Env }>) {
  return c.json({
    ok: true,
    message: "API is healthy",
  });
}

export async function getSecrets(c: Context<{ Bindings: Env }>) {
  const secrets = await c.env.db.select().from(secretsTable);
  return c.json(secrets);
}

export async function getSecretById(c: Context<{ Bindings: Env }>) {
  const id = Number(c.req.param("id"));
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
