import { NextRequest, NextResponse } from "next/server";
import { internalRegistrationSubmit } from "../../../../../api/internal/events/contracts";
import { INTERNAL_SENSITIVE_NO_STORE_HEADERS, requireInternalApiAuth } from "../../_auth";

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as
    | { eventId?: string; name?: string; email?: string; phone?: string; attendanceIntent?: "attending" | "not-attending" | "unsure" }
    | null;

  const result = internalRegistrationSubmit({ body: body ?? undefined });
  if (!result.ok) {
    const status = result.error === "Validation failed" ? 400 : result.error === "Event not found" ? 404 : 500;
    return NextResponse.json(result, { status, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { status: 201, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
