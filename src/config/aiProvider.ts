import type { AIProvider } from '../ai/providers/AIProvider';
import { CodexProvider } from '../ai/providers/CodexProvider';
import { ChatGPTApiProvider } from '../ai/providers/ChatGPTApiProvider';

export type AIProviderName = 'openai-api' | 'codex';

export function getAIProviderFromEnv(env = process.env): AIProvider {
  const selected = (env.AI_PROVIDER ?? 'openai-api') as AIProviderName;

  switch (selected) {
    case 'codex':
      return new CodexProvider();
    case 'openai-api':
    default:
      return new ChatGPTApiProvider();
  }
}
