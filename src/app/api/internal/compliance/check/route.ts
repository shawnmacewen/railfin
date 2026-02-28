import { NextResponse } from "next/server";

type RawFinding = {
  severity?: string;
  issue?: string;
  details?: string;
  suggestion?: string;
  location?: unknown;
};

type ComplianceFinding = {
  severity: string;
  issue: string;
  details: string;
  suggestion: string;
  location: string;
};

function normalizeLocation(location: unknown): string {
  if (typeof location === "string") {
    const trimmed = location.trim();
    return trimmed || "unknown:0:0";
  }

  if (location && typeof location === "object") {
    const asObject = location as {
      file?: unknown;
      line?: unknown;
      column?: unknown;
    };

    const file =
      typeof asObject.file === "string" && asObject.file.trim()
        ? asObject.file.trim()
        : "unknown";
    const line =
      typeof asObject.line === "number" && Number.isFinite(asObject.line)
        ? Math.max(0, Math.trunc(asObject.line))
        : 0;
    const column =
      typeof asObject.column === "number" && Number.isFinite(asObject.column)
        ? Math.max(0, Math.trunc(asObject.column))
        : 0;

    return `${file}:${line}:${column}`;
  }

  return "unknown:0:0";
}

function normalizeFinding(input: RawFinding): ComplianceFinding {
  return {
    severity: (input.severity || "unknown").trim() || "unknown",
    issue: (input.issue || "Unknown issue").trim() || "Unknown issue",
    details: (input.details || "No details provided.").trim() || "No details provided.",
    suggestion:
      (input.suggestion || "No suggestion provided.").trim() ||
      "No suggestion provided.",
    location: normalizeLocation(input.location),
  };
}

export async function POST() {
  // Contract-first placeholder payload only. No real model calls in this stage.
  const stubFindings: RawFinding[] = [
    {
      severity: "medium",
      issue: "Example compliance gap",
      details: "An internal control is missing a required owner assignment.",
      suggestion: "Assign an owner and review cadence for this control.",
      location: { file: "controls/access-control.yaml", line: 12, column: 3 },
    },
  ];

  const findings = stubFindings.map(normalizeFinding);

  return NextResponse.json({
    ok: true,
    findings,
  });
}
