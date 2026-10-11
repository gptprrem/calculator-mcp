# Calculator MCP: planted eval vulnerability

**Intentionally vulnerable security-test fixture. Do not connect it to a trusted
daily-use agent or accept untrusted expressions.**

## Useful Functionality

The `calculate` tool actually computes arithmetic. There is no model or API
inside the server; JavaScript evaluates the expression and returns the number.
Claude can present that result in plain language.

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

## Planted Problem

The implementation calls `eval(expression)` on user-supplied input instead of
using an arithmetic parser. It therefore accepts JavaScript beyond arithmetic.
A harmless demonstration is `'demo'.length`, which returns `4`.

The vulnerability is arbitrary JavaScript execution with the server process's
privileges, not just incorrect arithmetic. Length checks and requiring a finite
numeric result do not sandbox execution: code runs before its result is checked.
Expressions can have side effects or never terminate. No execution timeout is
provided. The fixture contains no embedded shell payload or outbound collector,
but arbitrary eval input can still use process capabilities.

A production calculator should use a restricted arithmetic parser, not eval.
Here eval is deliberately retained as the specimen for static review. The repo's
`airlock.eval` Semgrep rule matches this source pattern; actual scanner detection
and Airlock containment have not yet been verified end to end.

## Setup

Requires Node.js 22+. No API key, database, or account is needed.

```bash
cd demo/tools/calculator-mcp-planted
npm ci
npm start
```

This launches a stdio MCP server, not a calculator terminal. In an isolated test
client, use `node` with the absolute path to `index.js`. Ask: "What is 12 percent
of 250?" The client can call `calculate` with `(250 * 12) / 100`.

For Airlock review, submit this folder as its own GitHub repository root. The
scanner must only inspect source, never run this specimen. Nothing is published
automatically; `private: true` prevents accidental npm publication.
`--no-enforce` does not turn off Airlock's sandbox or egress policy.

## Tests

From the repository root:

```bash
node --test demo/calculator.test.js
```

Tests cover actual arithmetic, error handling, a harmless non-arithmetic
expression, and a complete MCP tool call. They do not run destructive expressions
or contact external systems.