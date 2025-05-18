import { HTTPException } from "hono/http-exception";
import { HTTPResponseError } from "hono/types";
import { Context } from "hono";
import { Env } from "@/types";

export const handleError = (
  err: Error | HTTPResponseError,
  c: Context<{ Bindings: Env }>
) => {
  if (err instanceof HTTPException) {
    console.log("HTTPException", err);
    return c.json({ error: err.message }, err.status);
  }

  if (err instanceof Error) {
    console.log("Error", err);
    return c.text(`Error: ${err.message}`, 500);
  }
  console.error(`${err}`);
  return c.text("An unknown error occurred", 500);
};
