import { NextRequest, NextResponse } from "next/server";
import { internalContentGenerate } from "../../../../../api/internal/content/generate";
import { requireInternalApiAuth, INTERNAL_SENSITIVE_NO_STORE_HEADERS } from "../../_auth";

export async function POST(request: NextRequest) {
  const unauthorized = requireInternalApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }
  const body = (await request.json().catch(() => ({}))) as {
    prompt?: string;
    contentType?: "blog" | "linkedin" | "newsletter" | "x-thread";
    template?: "default" | "conversion";
    preset?: {
      tone?: "professional" | "friendly" | "bold";
      intent?: "educate" | "engage" | "convert";
    };
  };

  const result = await internalContentGenerate({
    method: "POST",
    body,
  });

  if (!result.ok) {
    return NextResponse.json(result, {
      status: 400,
      headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS,
    });
  }

  return NextResponse.json(result, { headers: INTERNAL_SENSITIVE_NO_STORE_HEADERS });
}
