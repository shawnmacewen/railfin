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
    env: { AI_PROVIDER: "codex" } as NodeJS.ProcessEnv,
    providerFactory: makeFactory({ codex: "ok", "chatgpt-api": "fail" }),
  });

  assert.ok("completion" in result);
  assert.equal(result.diagnostic.attempts.length, 1);
  assert.deepEqual(result.diagnostic.attempts[0], { provider: "codex", ok: true });
});

test("provider chain falls back when primary fails and secondary succeeds", async () => {
  const result = await completeWithDeterministicFallback({
    flow: "content-generate",
    prompt: "hello",
    env: { AI_PROVIDER: "codex" } as NodeJS.ProcessEnv,
    providerFactory: makeFactory({ codex: "fail", "chatgpt-api": "ok" }),
  });

  assert.ok("completion" in result);
  assert.equal(result.diagnostic.attempts.length, 2);
  assert.equal(result.diagnostic.attempts[0]?.provider, "codex");
  assert.equal(result.diagnostic.attempts[0]?.ok, false);
  assert.equal(result.diagnostic.attempts[1]?.provider, "chatgpt-api");
  assert.equal(result.diagnostic.attempts[1]?.ok, true);
});

test("provider chain returns degraded diagnostics when all providers fail", async () => {
  const result = await completeWithDeterministicFallback({
    flow: "content-generate",
    prompt: "hello",
    env: { AI_PROVIDER: "codex" } as NodeJS.ProcessEnv,
    providerFactory: makeFactory({ codex: "fail", "chatgpt-api": "fail" }),
  });

  assert.ok(!("completion" in result));
  assert.equal(result.diagnostic.attempts.length, 2);
  assert.equal(result.diagnostic.attempts.every((attempt) => !attempt.ok), true);
});
