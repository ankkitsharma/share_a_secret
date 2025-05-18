import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { Env } from "@/types";
import { getDb } from "@/db";
import { getSum, getRoot } from "@/handlers";
import { apiV1App } from "./api";

console.log("hello");

export const createApp = () => {
  let app = new Hono<{ Bindings: Env }>()
    .onError((err, c) => {
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
      getSum
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
      getRoot
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
            {
              url: "http://localhost:8787",
              description: "Local Server",
            },
          ],
        },
      })
    )
    .get("/swagger", swaggerUI({ url: "/openapi" }));

  return app;
};
