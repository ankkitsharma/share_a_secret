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

export const createSecretDesc = describeRoute({
  tags: ["Secrets"],
  summary: "Create a secret",
  description: "Creates a new secret",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            secret: { type: "string" },
            decryptionKey: { type: "string" },
            destroyAfter: { type: "string" },
            oneTime: { type: "boolean" },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Secret created",
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
  },
});

export const updateSecretDesc = describeRoute({
  tags: ["Secrets"],
  summary: "Update a secret",
  description: "Updates a secret",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            secret: { type: "string" },
            decryptionKey: { type: "string" },
            destroyAfter: { type: "string" },
            oneTime: { type: "boolean" },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Secret updated",
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
  },
});

export const verifySecretPasscodeDesc = describeRoute({
  tags: ["Secrets"],
  summary: "Verify secret passcode",
  description: "Verify the passcode for a protected secret",
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["passcode"],
          properties: {
            passcode: { type: "string" },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Passcode verified successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              secret: { type: "string" },
              oneTime: { type: "boolean" },
              destroyAfter: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    401: {
      description: "Invalid passcode",
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

export const markSecretAsViewedDesc = describeRoute({
  tags: ["Secrets"],
  summary: "Mark secret as viewed",
  description:
    "Marks a secret as viewed and deletes it if it's a one-time secret",
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "Secret marked as viewed",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string" },
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
