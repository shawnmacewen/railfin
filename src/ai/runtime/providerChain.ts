import type { AIProvider } from "../providers/AIProvider";
import { ChatGPTApiProvider } from "../providers/ChatGPTApiProvider";
import { CodexProvider } from "../providers/CodexProvider";
import { getAIProviderFromEnv } from "../../config/aiProvider";

export type RuntimeProviderName = "openai-api" | "codex";

export type ProviderRuntimeErrorKind =
  | "provider_error"
  | "provider_timeout"
  | "provider_invalid_response"
  | "provider_config";

export type ProviderAttemptDiagnostic = {
  provider: RuntimeProviderName;
  ok: boolean;
  errorKind?: ProviderRuntimeErrorKind;
};

export type ProviderChainDiagnostic = {
  flow: "content-generate" | "compliance-check";
  primary: RuntimeProviderName;
  fallback: RuntimeProviderName;
  fallbackDeferred: boolean;
  attempts: ProviderAttemptDiagnostic[];
};

export type ProviderChainSuccess = {
  completion: string;
  diagnostic: ProviderChainDiagnostic;
};

export type ProviderChainFailure = {
  diagnostic: ProviderChainDiagnostic;
};

type ProviderFactory = (name: RuntimeProviderName, env: NodeJS.ProcessEnv) => AIProvider;

function selectPrimary(_env = process.env): RuntimeProviderName {
  return "openai-api";
}

function secondaryProviderName(primary: RuntimeProviderName): RuntimeProviderName {
  return primary === "openai-api" ? "codex" : "openai-api";
}

function instantiateProvider(name: RuntimeProviderName, env = process.env): AIProvider {
  if (name === "openai-api") {
    return new ChatGPTApiProvider();
  }

  if (name === "codex") {
    return new CodexProvider();
  }

  return getAIProviderFromEnv(env);
}

function classifyProviderError(error: unknown): ProviderRuntimeErrorKind {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("timed out") || message.includes("timeout")) {
    return "provider_timeout";
  }

  if (message.includes("missing api key") || message.includes("missing") || message.includes("invalid api key")) {
    return "provider_config";
  }

  if (message.includes("empty completion") || message.includes("invalid") || message.includes("json")) {
    return "provider_invalid_response";
  }

  return "provider_error";
}

export async function completeWithDeterministicFallback(options: {
  flow: "content-generate" | "compliance-check";
  prompt: string;
  env?: NodeJS.ProcessEnv;
  providerFactory?: ProviderFactory;
}): Promise<ProviderChainSuccess | ProviderChainFailure> {
  const env = options.env ?? process.env;
  const primary = selectPrimary(env);
  const fallback = secondaryProviderName(primary);
  const providerFactory = options.providerFactory ?? instantiateProvider;

  const diagnostic: ProviderChainDiagnostic = {
    flow: options.flow,
    primary,
    fallback,
    fallbackDeferred: true,
    attempts: [],
  };

  const provider = providerFactory(primary, env);

  try {
    const completion = await provider.complete(options.prompt);
    diagnostic.attempts.push({ provider: primary, ok: true });

    return {
      completion,
      diagnostic,
    };
  } catch (error) {
    diagnostic.attempts.push({
      provider: primary,
      ok: false,
      errorKind: classifyProviderError(error),
    });
  }

  return {
    diagnostic,
  };
}
