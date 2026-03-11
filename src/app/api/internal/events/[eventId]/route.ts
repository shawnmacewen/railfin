import { NextRequest, NextResponse } from "next/server";

import { internalEventsDelete, internalEventsGet, internalEventsUpdate } from "../../../../../api/internal/events/contracts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../../_auth";

type EventMutationBody = { title?: unknown; date?: unknown; summary?: unknown; location?: unknown; status?: "draft" | "scheduled" | "cancelled" | "completed" };

async function parseBody(request: NextRequest): Promise<EventMutationBody | undefined> {
  const body = (await request.json().catch(() => null)) as EventMutationBody | null;
  return body ?? undefined;
}

function statusForError(error: string): number {
  if (error === "Validation failed") return 400;
  if (error === "Event not found") return 404;
  return 500;
}

export async function GET(request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const params = await context.params;
  const result = internalEventsGet({ eventId: params.eventId });

  if (!result.ok) {
    return NextResponse.json(result, { status: statusForError(result.error), headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const params = await context.params;
  const body = await parseBody(request);
  const result = internalEventsUpdate({ eventId: params.eventId, body });

  if (!result.ok) {
    return NextResponse.json(result, { status: statusForError(result.error), headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  return PATCH(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const params = await context.params;
  const result = internalEventsDelete({ eventId: params.eventId });

  if (!result.ok) {
    return NextResponse.json(result, { status: statusForError(result.error), headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
