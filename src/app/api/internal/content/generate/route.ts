import { NextResponse } from "next/server";
import { internalContentGenerate } from "../../../../../api/internal/content/generate";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    prompt?: string;
    contentType?: "blog" | "linkedin" | "newsletter" | "x-thread";
  };

  const result = await internalContentGenerate({
    method: "POST",
    body,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
