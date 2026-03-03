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
    mode?: "single" | "package";
    contentType?: "blog" | "linkedin" | "newsletter" | "x-thread";
    package?: {
      assets?: Array<{
        assetType?: "email" | "linkedin" | "x-thread";
        prompt?: string;
      }>;
    };
    template?: "default" | "conversion";
    tone?: "professional" | "friendly" | "bold";
    intent?: "educate" | "engage" | "convert";
    audience?: "executive" | "practitioner" | "general";
    objective?: "awareness" | "consideration" | "decision";
    preset?: {
      tone?: "professional" | "friendly" | "bold";
      intent?: "educate" | "engage" | "convert";
    };
    controls?: {
      lengthTarget?: "short" | "medium" | "long";
      formatStyle?: "standard" | "bullet" | "outline";
      audience?: "executive" | "practitioner" | "general";
      objective?: "awareness" | "consideration" | "decision";
    };
    controlProfile?: "social-quick" | "balanced-default" | "deep-outline";
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
