type LoginRequestBody = {
  email?: string;
  password?: string;
  next?: string;
};

type LoginResponseBody = {
  ok: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
};

const DEFAULT_REDIRECT = "/";

function toSafeRedirect(next?: string): string {
  if (!next) return DEFAULT_REDIRECT;
  return next.startsWith("/") ? next : DEFAULT_REDIRECT;
}

export async function POST(request: Request): Promise<Response> {
  let body: LoginRequestBody | null = null;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    const payload: LoginResponseBody = {
      ok: false,
      error: "Invalid request body.",
    };

    return Response.json(payload, { status: 400 });
  }

  const email = body?.email?.trim();
  const password = body?.password;

  if (!email || !password) {
    const payload: LoginResponseBody = {
      ok: false,
      error: "Email and password are required.",
    };

    return Response.json(payload, { status: 400 });
  }

  // MVP contract endpoint only. Real auth (Supabase verify/session) is intentionally deferred.
  const payload: LoginResponseBody = {
    ok: true,
    message: "Login accepted (contract placeholder).",
    redirectTo: toSafeRedirect(body?.next),
  };

  return Response.json(payload, { status: 200 });
}
