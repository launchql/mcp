import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShape } from "zod";

type EmptyObject = Record<string, never>;

// Function overloads to support both usage patterns
export function createTool(callback: ToolCallback): {
  schema: EmptyObject;
  handler: ToolCallback;
};

export function createTool<T extends ZodRawShape>(
  schema: T,
  handler: ToolCallback<T>,
): { schema: T; handler: ToolCallback<T> };

/**
 * Utility for creating MCP tool definitions with proper typing.
 * Supports both parameter-less tools (single callback) and parameterized tools (schema + callback).
 * Returns an object with schema and handler for use with McpServer.tool().
 */
export function createTool<T extends ZodRawShape>(
  schemaOrCallback: T | ToolCallback,
  handler?: ToolCallback<T>,
) {
  // Called with just a callback
  if (typeof schemaOrCallback === "function") {
    return {
      schema: {} as EmptyObject,
      handler: schemaOrCallback,
    };
  }

  // Called with schema and handler
  if (!handler) {
    throw new Error("Handler is required when providing a schema");
  }

  return {
    schema: schemaOrCallback,
    handler,
  };
}
