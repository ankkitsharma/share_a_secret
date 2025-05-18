import { Hono } from "hono";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { Env } from "@/types";
import { getDb } from "@/db";
import { getSum, getRoot } from "@/handlers";
import { apiV1App } from "./api";
import { rootDesc, sumDesc } from "@/types/swagger";
import { handleError } from "@/utils";

export const createApp = () => {
  let app = new Hono<{ Bindings: Env }>()
    .onError(handleError)
    .use("*", async (c, next) => {
      if (!c.env.db) {
        c.env.db = getDb(c.env.DATABASE_URL);
        console.log("Database connection initialized");
      }
      await next();
    })
    .route("/apiv1", apiV1App)
    .get("/sum", sumDesc, getSum)
    .get("/", rootDesc, getRoot);

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
