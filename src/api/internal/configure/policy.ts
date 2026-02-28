import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

type ConfigurePolicyRecord = {
  policyText: string;
  updatedAt: string;
  version: number;
};

type ConfigurePolicyBlocked = {
  kind: "BLOCKED";
  error: string;
  todo: string;
  missingEnv?: string[];
  requiredSql?: string;
};

type ConfigurePolicyGetResponse =
  | {
      ok: true;
      data: ConfigurePolicyRecord;
      meta: {
        persistence: "supabase-table";
        note: string;
      };
    }
  | {
      ok: false;
      error: string;
      blocked: ConfigurePolicyBlocked;
    };

type ConfigurePolicySaveResponse =
  | {
      ok: true;
      data: ConfigurePolicyRecord;
      meta: {
        persistence: "supabase-table";
        note: string;
      };
    }
  | {
      ok: false;
      error: string;
      blocked?: ConfigurePolicyBlocked;
      fieldErrors?: Array<{
        field: "policyText";
        message: string;
      }>;
    };

type ConfigurePolicyRow = {
  scope: string;
  policy_text: string;
  updated_at: string;
  version: number;
};

const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;
const POLICY_SCOPE = "default";
// Conservative guardrail limit to reduce accidental large sensitive-data dumps.
const CONFIGURE_POLICY_TEXT_MAX_LENGTH = 8000;
const REQUIRED_SQL = `create table if not exists public.configure_policy (
  scope text primary key,
  policy_text text not null default '',
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);`;

const PERSISTENCE_NOTE =
  "Configure policy is persisted in Supabase table public.configure_policy.";

function buildMeta() {
  return {
    persistence: "supabase-table" as const,
    note: PERSISTENCE_NOTE,
  };
}

function blocked(error: string, missingEnv?: string[]): ConfigurePolicyBlocked {
  return {
    kind: "BLOCKED",
    error,
    todo:
      "Provide required Supabase env vars and create public.configure_policy table before retrying configure policy GET/POST.",
    missingEnv,
    requiredSql: REQUIRED_SQL,
  };
}

function getClientOrBlocked(): { ok: true; client: SupabaseClient } | { ok: false; blocked: ConfigurePolicyBlocked } {
  const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missingEnv.length > 0) {
    return {
      ok: false,
      blocked: blocked(
        `Missing required Supabase environment variables: ${missingEnv.join(", ")}`,
        missingEnv,
      ),
    };
  }

  return {
    ok: true,
    client: createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    ),
  };
}

function toRecord(row: ConfigurePolicyRow): ConfigurePolicyRecord {
  return {
    policyText: row.policy_text,
    updatedAt: row.updated_at,
    version: row.version,
  };
}

export async function getCurrentConfigurePolicy(): Promise<ConfigurePolicyGetResponse> {
  const clientOrBlocked = getClientOrBlocked();
  if (!clientOrBlocked.ok) {
    return {
      ok: false,
      error: clientOrBlocked.blocked.error,
      blocked: clientOrBlocked.blocked,
    };
  }

  const { data, error } = await clientOrBlocked.client
    .from("configure_policy")
    .select("scope, policy_text, updated_at, version")
    .eq("scope", POLICY_SCOPE)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      error:
        "Configure policy persistence blocked: unable to read from public.configure_policy. Ensure table exists and service role has access.",
      blocked: blocked(
        "Unable to read from public.configure_policy. Ensure table exists and service role has access.",
      ),
    };
  }

  if (!data) {
    return {
      ok: true,
      data: {
        policyText: "",
        updatedAt: new Date(0).toISOString(),
        version: 1,
      },
      meta: buildMeta(),
    };
  }

  return {
    ok: true,
    data: toRecord(data as ConfigurePolicyRow),
    meta: buildMeta(),
  };
}

export async function saveConfigurePolicy(input: {
  policyText?: string;
}): Promise<ConfigurePolicySaveResponse> {
  const policyText = input.policyText?.trim() ?? "";

  if (!policyText) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: [
        {
          field: "policyText",
          message: "Policy text is required",
        },
      ],
    };
  }

  if (policyText.length > CONFIGURE_POLICY_TEXT_MAX_LENGTH) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: [
        {
          field: "policyText",
          message: `Policy text must be ${CONFIGURE_POLICY_TEXT_MAX_LENGTH} characters or fewer`,
        },
      ],
    };
  }

  const current = await getCurrentConfigurePolicy();
  if (!current.ok) {
    return {
      ok: false,
      error: current.error,
      blocked: current.blocked,
    };
  }

  const clientOrBlocked = getClientOrBlocked();
  if (!clientOrBlocked.ok) {
    return {
      ok: false,
      error: clientOrBlocked.blocked.error,
      blocked: clientOrBlocked.blocked,
    };
  }

  const nextVersion = Math.max(1, current.data.version) + 1;

  const { data, error } = await clientOrBlocked.client
    .from("configure_policy")
    .upsert(
      {
        scope: POLICY_SCOPE,
        policy_text: policyText,
        updated_at: new Date().toISOString(),
        version: nextVersion,
      },
      { onConflict: "scope" },
    )
    .select("scope, policy_text, updated_at, version")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error:
        "Configure policy persistence blocked: unable to write to public.configure_policy. Ensure table exists and service role has access.",
      blocked: blocked(
        "Unable to write to public.configure_policy. Ensure table exists and service role has access.",
      ),
    };
  }

  return {
    ok: true,
    data: toRecord(data as ConfigurePolicyRow),
    meta: buildMeta(),
  };
}

export const CONFIGURE_POLICY_REQUIRED_ENV = [...REQUIRED_ENV];
export const CONFIGURE_POLICY_REQUIRED_SQL = REQUIRED_SQL;
export const CONFIGURE_POLICY_MAX_LENGTH = CONFIGURE_POLICY_TEXT_MAX_LENGTH;
