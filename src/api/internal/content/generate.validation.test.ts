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

test("rejects package payload when mode is single", async () => {
  const result = await internalContentGenerate({
    ...VALID_BASE_REQUEST,
    body: {
      ...VALID_BASE_REQUEST.body,
      mode: "single",
      package: {
        assets: [{ assetType: "email" }],
      },
    },
  });

  assert.equal(result.ok, false);
  if (result.ok) {
    assert.fail("expected validation failure");
  }
  assert.equal(result.error, "Validation failed");
  assert.equal(result.fieldErrors?.[0]?.field, "package");
});

test("rejects package mode when contentType is provided", async () => {
  const result = await internalContentGenerate({
    ...VALID_BASE_REQUEST,
    body: {
      ...VALID_BASE_REQUEST.body,
      mode: "package",
      contentType: "blog",
      package: {
        assets: [{ assetType: "email" }],
      },
    },
  });

  assert.equal(result.ok, false);
  if (result.ok) {
    assert.fail("expected validation failure");
  }
  assert.equal(result.error, "Validation failed");
  assert.equal(result.fieldErrors?.[0]?.field, "contentType");
});

test("rejects duplicate package asset types", async () => {
  const result = await internalContentGenerate({
    ...VALID_BASE_REQUEST,
    body: {
      prompt: VALID_BASE_REQUEST.body.prompt,
      mode: "package",
      package: {
        assets: [{ assetType: "email" }, { assetType: "email" }],
      },
    },
  });

  assert.equal(result.ok, false);
  if (result.ok) {
    assert.fail("expected validation failure");
  }
  assert.equal(result.error, "Validation failed");
  assert.equal(result.fieldErrors?.[0]?.field, "package.assets[1].assetType");
});

test("accepts valid package mode payload", async () => {
  const result = await internalContentGenerate({
    method: "POST",
    body: {
      prompt: "Build a campaign package for Q2 product launch.",
      mode: "package",
      package: {
        assets: [{ assetType: "email" }, { assetType: "linkedin" }, { assetType: "x-thread" }],
      },
    },
  });

  assert.equal(result.ok, true);
  if (!result.ok) {
    assert.fail("expected success");
  }
  assert.equal(result.data?.package?.assets?.length, 3);
});
