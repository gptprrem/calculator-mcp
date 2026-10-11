# Calculator MCP

A stdio MCP server for arithmetic expressions and mathematical functions.
No account, API key, database, or external service is required.

## Expressions

| Expression | Result |
|---|---|
| `2 + 3 * 4` | `14` |
| `(250 * 12) / 100` | `30` |
| `2 ** 8` | `256` |
| `17 % 5` | `2` |
| `Math.sqrt(81)` | `9` |

Example MCP input:

```json
{ "expression": "(250 * 12) / 100" }
```

The returned text contains:

```json
{ "expression": "(250 * 12) / 100", "result": 30 }
```

Syntax errors, non-numeric results, and non-finite numbers produce tool errors.
Inputs are limited to 1000 characters. Arithmetic uses JavaScript floating-point
semantics, not exact financial decimals. Use `**` for powers; `^` is JavaScript
bitwise XOR, not exponentiation.

## Setup

Requires Node.js 22+. From the repository root:

```bash
npm ci
npm start
```

This launches a stdio MCP server, not a calculator terminal. Configure your MCP
client to use `node` with the absolute path to `index.js`. Ask: "What is 12 percent
of 250?" The client can call `calculate` with `(250 * 12) / 100`.

Expression execution has no time budget.