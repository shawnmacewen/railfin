import { NextRequest, NextResponse } from "next/server";
import { internalEventsCreate, internalEventsList } from "../../../../api/internal/events/contracts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../_auth";

export async function GET(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;
  return NextResponse.json(internalEventsList(), { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as
    | { title?: string; date?: string; summary?: string; location?: string; status?: "draft" | "scheduled" | "cancelled" | "completed" }
    | null;

  const result = internalEventsCreate({ body: body ?? undefined });
  if (!result.ok) {
    const status = result.error === "Validation failed" ? 400 : 500;
    return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { status: 201, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
