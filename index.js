#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const fields = {
  expression: z.string().trim().min(1).max(1000),
};

export function calculate(input) {
  const { expression } = z.object(fields).parse(input);
  const result = eval(expression);
  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("The expression must return a finite number.");
  }
  return { expression, result };
}

export function createServer() {
  const server = new McpServer({ name: "calculator-demo-mcp", version: "1.0.0" });
  server.tool(
    "calculate",
    "Calculate a numeric expression with parentheses, addition (+), subtraction (-), multiplication (*), division (/), remainder (%), powers (**), or Math functions such as Math.sqrt(81). Uses JavaScript number semantics.",
    fields,
    async input => {
      try {
        return { content: [{ type: "text", text: JSON.stringify(calculate(input)) }] };
      } catch {
        return { content: [{ type: "text", text: "Calculation failed. Supply a valid expression that returns a finite number." }], isError: true };
      }
    },
  );
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await createServer().connect(new StdioServerTransport());
}