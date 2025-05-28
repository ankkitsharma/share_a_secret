import { Context } from "hono";
import { eq } from "drizzle-orm";
import { secretsTable } from "@/db/schema";
import { Env } from "@/types";
import bcrypt from "bcryptjs";

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

  const storedSecret = secret[0];

  // If the secret has a decryption key, require passcode verification
  if (storedSecret.decryptionKey) {
    return c.json({ error: "Passcode required" }, 401);
  }

  // For secrets without passcode, delete if it's one-time
  if (storedSecret.oneTime) {
    await c.env.db.delete(secretsTable).where(eq(secretsTable.id, id));
  }

  return c.json({
    secret: storedSecret.secret,
    oneTime: storedSecret.oneTime === 1,
    destroyAfter: storedSecret.destroyAfter,
  });
}

export async function verifySecretPasscode(c: Context<{ Bindings: Env }>) {
  const id = Number(c.req.param("id"));
  const { passcode } = await c.req.json();

  const secret = await c.env.db
    .select()
    .from(secretsTable)
    .where(eq(secretsTable.id, id))
    .limit(1);

  if (secret.length === 0) {
    return c.json({ error: "Secret not found" }, 404);
  }

  const storedSecret = secret[0];

  if (!storedSecret.decryptionKey) {
    return c.json({ error: "This secret is not protected by a passcode" }, 400);
  }

  const isValid = await bcrypt.compare(passcode, storedSecret.decryptionKey);
  if (!isValid) {
    return c.json({ error: "Invalid passcode" }, 401);
  }

  // Return the secret without deleting it yet
  return c.json({
    secret: storedSecret.secret,
    oneTime: storedSecret.oneTime === 1,
    destroyAfter: storedSecret.destroyAfter,
  });
}

export async function createSecret(c: Context<{ Bindings: Env }>) {
  const { secret, passcode, destroyAfter, oneTime } = await c.req.json();

  // Hash the passcode if provided
  const decryptionKey = passcode ? await bcrypt.hash(passcode, 10) : null;

  const [newSecret] = await c.env.db
    .insert(secretsTable)
    .values({
      secret,
      decryptionKey,
      destroyAfter,
      oneTime: oneTime ? 1 : 0,
    })
    .returning();

  console.log("Inserted row:", newSecret);
  return c.json({
    message: "Secret created",
    url: `/secret/${newSecret.id}`,
  });
}

export async function updateSecret(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json();
  const id = Number(c.req.param("id"));
  const { secret, decryptionKey, destroyAfter, oneTime } = body;

  const updateData = {
    ...(secret && { secret }),
    ...(decryptionKey && { decryptionKey }),
    ...(destroyAfter && { destroyAfter }),
    ...(oneTime && { oneTime }),
  };

  await c.env.db
    .update(secretsTable)
    .set(updateData)
    .where(eq(secretsTable.id, id));
  return c.json({ message: "Secret updated", url: `/secret/${id}` });
}

// New endpoint to mark a secret as viewed and delete if one-time
export async function markSecretAsViewed(c: Context<{ Bindings: Env }>) {
  const id = Number(c.req.param("id"));

  const secret = await c.env.db
    .select()
    .from(secretsTable)
    .where(eq(secretsTable.id, id))
    .limit(1);

  if (secret.length === 0) {
    return c.json({ error: "Secret not found" }, 404);
  }

  const storedSecret = secret[0];

  // Only delete if it's a one-time secret
  if (storedSecret.oneTime) {
    await c.env.db.delete(secretsTable).where(eq(secretsTable.id, id));
  }

  return c.json({ message: "Secret marked as viewed" });
}
