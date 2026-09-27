#!/usr/bin/env node
// Minimal stdio MCP server exposing TypeSafe's System One API (Jev) as a tool.
// No dependencies: speaks newline-delimited JSON-RPC 2.0 over stdin/stdout.
// Reads the API key from TYPESAFE_API_KEY; never log or echo it.

import { createInterface } from "node:readline";

const API_URL = "https://api.typesafe.ai/v1/systemone";
const DEFAULT_MODEL = "jev-latest";
const MAX_RETRIES = 4;

const TOOL = {
  name: "jev_evaluate",
  description:
    "Evaluate a state against typed questions with TypeSafe's Jev model. " +
    "Each question is evaluated independently and in parallel against the same state. " +
    "Question types: 'noul' (yes/no, returns probability 0-1; criteria optional {true, false}), " +
    "'choice' (pick one option; criteria is a map of option -> description or null, max 255), " +
    "'score' (rate on ordered levels; criteria is an array of 2-10 level descriptions). " +
    "Choice and Score answers include probabilities and confidence. Ask narrow, atomic questions " +
    "and reference nested state fields with backticked paths like `ticket.messages[0].text`.",
  inputSchema: {
    type: "object",
    properties: {
      state: {
        description:
          "The content to evaluate: a string, or structured JSON (object/array) with named fields.",
      },
      questions: {
        type: "object",
        description:
          "Map of question id -> question. Ids are for your code only and are not sent to the model, " +
          "so put the full meaning in `instructions`.",
        additionalProperties: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["noul", "choice", "score"] },
            instructions: {
              description: "The question: a string, or an object/array holding the question plus data it references.",
            },
            criteria: {
              description:
                "noul: optional {true, false}; choice: required map of option -> description|null; " +
                "score: required ordered array of level descriptions.",
            },
          },
          required: ["type", "instructions"],
        },
      },
      model: {
        type: "string",
        description: `Model to use. Defaults to "${DEFAULT_MODEL}".`,
      },
    },
    required: ["state", "questions"],
  },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function evaluate({ state, questions, model }) {
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) {
    throw new Error("TYPESAFE_API_KEY is not set in the environment.");
  }
  const body = JSON.stringify({ state, model: model || DEFAULT_MODEL, questions });

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await res.text();
    if (res.ok) return JSON.parse(text);
    // Back off on rate limits and overload, per the API reference.
    if ((res.status === 429 || res.status === 529) && attempt < MAX_RETRIES) {
      await sleep(500 * 2 ** attempt);
      continue;
    }
    throw new Error(`TypeSafe API returned ${res.status}: ${text}`);
  }
}

function send(message) {
  process.stdout.write(JSON.stringify(message) + "\n");
}

async function handle(request) {
  const { id, method, params } = request;
  switch (method) {
    case "initialize":
      return {
        protocolVersion: params?.protocolVersion ?? "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "typesafe", version: "0.1.0" },
      };
    case "ping":
      return {};
    case "tools/list":
      return { tools: [TOOL] };
    case "tools/call": {
      if (params?.name !== TOOL.name) {
        throw Object.assign(new Error(`Unknown tool: ${params?.name}`), { code: -32602 });
      }
      try {
        const result = await evaluate(params.arguments ?? {});
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: String(err.message) }], isError: true };
      }
    }
    default:
      if (id === undefined) return undefined; // notification; no reply
      throw Object.assign(new Error(`Method not found: ${method}`), { code: -32601 });
  }
}

const rl = createInterface({ input: process.stdin });
rl.on("line", async (line) => {
  if (!line.trim()) return;
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
    return;
  }
  try {
    const result = await handle(request);
    if (request.id !== undefined && result !== undefined) {
      send({ jsonrpc: "2.0", id: request.id, result });
    }
  } catch (err) {
    if (request.id !== undefined) {
      send({
        jsonrpc: "2.0",
        id: request.id,
        error: { code: err.code ?? -32603, message: err.message },
      });
    }
  }
});
