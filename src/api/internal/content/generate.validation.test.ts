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
