import { NextRequest, NextResponse } from "next/server";

import { internalContentDraft } from "../../../../../api/internal/content/draft";
import { requireInternalApiAuth, INTERNAL_SENSITIVE_NO_STORE_HEADERS } from "../../_auth";

type DraftPostBody = {
  title?: string;
  body?: string;
};

const UUID_V4_OR_COMPAT_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidDraftId(value: string): boolean {
  return UUID_V4_OR_COMPAT_REGEX.test(value);
}

export async function GET(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? undefined;

  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        error: "Draft id is required",
      },
      { status: 400, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS },
    );
  }

  if (!isValidDraftId(id)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed",
        fieldErrors: [
          {
            field: "id",
            message: "Draft id must be a valid UUID",
          },
        ],
      },
      { status: 400, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS },
    );
  }

  const result = await internalContentDraft({
    method: "GET",
    id,
  });

  if (!result.ok) {
    return NextResponse.json(result, {
      status: result.error === "Draft not found" ? 404 : 500,
      headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS,
    });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  const body = (await request.json().catch(() => ({}))) as DraftPostBody;
  const result = await internalContentDraft({
    method: "POST",
    body,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 500, headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
