import test from "node:test";
import assert from "node:assert/strict";

import { internalContentGenerate } from "./generate";

const VALID_BASE_REQUEST = {
  method: "POST" as const,
  body: {
    prompt: "Draft a launch update for our AI-assisted compliance workflow.",
    contentType: "blog" as const,
  },
};

test("rejects invalid controls enum values", async () => {
  const result = await internalContentGenerate({
    ...VALID_BASE_REQUEST,
    body: {
      ...VALID_BASE_REQUEST.body,
      controls: {
        lengthTarget: "tiny" as "short",
      },
    },
  });

  assert.equal(result.ok, false);
  if (result.ok) {
    assert.fail("expected validation failure");
  }
  assert.equal(result.error, "Invalid controls");
});

test("rejects controls object with unknown keys", async () => {
  const result = await internalContentGenerate({
    ...VALID_BASE_REQUEST,
    body: {
      ...VALID_BASE_REQUEST.body,
      controls: {
        formatStyle: "standard",
        unknown: "value",
      } as unknown as { formatStyle: "standard" },
    },
  });

  assert.equal(result.ok, false);
  if (result.ok) {
    assert.fail("expected validation failure");
  }
  assert.equal(result.error, "Invalid controls");
});

test("rejects preset object with unknown keys", async () => {
  const result = await internalContentGenerate({
    ...VALID_BASE_REQUEST,
    body: {
      ...VALID_BASE_REQUEST.body,
      preset: {
        tone: "professional",
        extra: "value",
      } as unknown as { tone: "professional" },
    },
  });

  assert.equal(result.ok, false);
  if (result.ok) {
    assert.fail("expected validation failure");
  }
  assert.equal(result.error, "Invalid preset");
});

test("rejects invalid controlProfile values", async () => {
  const result = await internalContentGenerate({
    ...VALID_BASE_REQUEST,
    body: {
      ...VALID_BASE_REQUEST.body,
      controlProfile: "invalid" as "social-quick",
    },
  });

  assert.equal(result.ok, false);
  if (result.ok) {
    assert.fail("expected validation failure");
  }
  assert.equal(result.error, "Invalid controlProfile");
});

test("accepts valid controlProfile values", async () => {
  const result = await internalContentGenerate({
    ...VALID_BASE_REQUEST,
    body: {
      ...VALID_BASE_REQUEST.body,
      controlProfile: "social-quick",
    },
  });

  assert.equal(result.ok, true);
});

test("accepts top-level tone intent audience objective controls", async () => {
  const result = await internalContentGenerate({
    ...VALID_BASE_REQUEST,
    body: {
      ...VALID_BASE_REQUEST.body,
      template: "conversion",
      controlProfile: "deep-outline",
      tone: "bold",
      intent: "convert",
      audience: "executive",
      objective: "decision",
    },
  });

  assert.equal(result.ok, true);
});

test("rejects conflicting top-level and nested values with clear validation failure", async () => {
  const result = await internalContentGenerate({
    ...VALID_BASE_REQUEST,
    body: {
      ...VALID_BASE_REQUEST.body,
      tone: "bold",
      preset: {
        tone: "friendly",
      },
    },
  });

  assert.equal(result.ok, false);
  if (result.ok) {
    assert.fail("expected validation failure");
  }

  assert.equal(result.error, "Validation failed");
  assert.equal(result.fieldErrors?.[0]?.field, "tone");
});
