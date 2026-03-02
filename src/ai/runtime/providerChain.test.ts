import test from "node:test";
import assert from "node:assert/strict";

import { completeWithDeterministicFallback, type RuntimeProviderName } from "./providerChain";

function makeFactory(behavior: Record<RuntimeProviderName, "ok" | "fail">) {
  return (name: RuntimeProviderName) => ({
    complete: async () => {
      if (behavior[name] === "ok") {
        return JSON.stringify({ ok: true, provider: name });
      }

      throw new Error(`${name} provider request failed`);
    },
  });
}

test("provider chain returns primary success without fallback attempt", async () => {
  const result = await completeWithDeterministicFallback({
    flow: "content-generate",
    prompt: "hello",
    env: { AI_PROVIDER: "openai-api" } as NodeJS.ProcessEnv,
    providerFactory: makeFactory({ "openai-api": "ok", codex: "fail" }),
  });

  assert.ok("completion" in result);
  assert.equal(result.diagnostic.attempts.length, 1);
  assert.deepEqual(result.diagnostic.attempts[0], { provider: "openai-api", ok: true });
});

test("provider chain defers fallback when openai primary fails", async () => {
  const result = await completeWithDeterministicFallback({
    flow: "content-generate",
    prompt: "hello",
    env: { AI_PROVIDER: "openai-api" } as NodeJS.ProcessEnv,
    providerFactory: makeFactory({ "openai-api": "fail", codex: "ok" }),
  });

  assert.ok(!("completion" in result));
  assert.equal(result.diagnostic.fallbackDeferred, true);
  assert.equal(result.diagnostic.attempts.length, 1);
  assert.equal(result.diagnostic.attempts[0]?.provider, "openai-api");
  assert.equal(result.diagnostic.attempts[0]?.ok, false);
});

test("provider chain ignores AI_PROVIDER override and remains openai-first", async () => {
  const result = await completeWithDeterministicFallback({
    flow: "content-generate",
    prompt: "hello",
    env: { AI_PROVIDER: "codex" } as NodeJS.ProcessEnv,
    providerFactory: makeFactory({ "openai-api": "ok", codex: "fail" }),
  });

  assert.ok("completion" in result);
  assert.equal(result.diagnostic.primary, "openai-api");
  assert.equal(result.diagnostic.attempts.length, 1);
  assert.equal(result.diagnostic.attempts[0]?.provider, "openai-api");
});
