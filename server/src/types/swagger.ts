import { describeRoute } from "hono-openapi";

export const getSecretsDesc = describeRoute({
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
                created_at: {
                  type: "string",
                  format: "date-time",
                },
              },
            },
          },
        },
      },
    },
  },
});

export const getSecretByIdDesc = describeRoute({
  tags: ["Secrets"],
  summary: "Get a secret by ID",
  description: "Retrieves a specific secret by its ID",
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: {
        type: "string",
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
              created_at: {
                type: "string",
                format: "date-time",
              },
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
});

export const getHealthDesc = describeRoute({
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
});

export const sumDesc = describeRoute({
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
});

export const rootDesc = describeRoute({
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
});
