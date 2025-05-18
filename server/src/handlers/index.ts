import { Context } from "hono"
import { Env } from "../types"

export async function testConnection(c: Env) {
  await c.db
    .execute("SELECT NOW()")
    .then((result) => {
      console.log("Current time from database:", result.rows[0])
    })
    .catch((error) => {
      console.error("Error executing time query:", error)
    })
}

export function getSum(c: Context<{ Bindings: Env }>) {
  const sum = 1 + 1
  return c.json({ sum })
}

export async function getRoot(c: Context<{ Bindings: Env }>) {
  await testConnection(c.env)
  return c.json({
    ok: true,
    message: "Hello Hono!",
  })
}
