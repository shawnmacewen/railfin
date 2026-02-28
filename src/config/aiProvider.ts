import type { AIProvider } from '../ai/providers/AIProvider';
import { CodexProvider } from '../ai/providers/CodexProvider';
import { ChatGPTApiProvider } from '../ai/providers/ChatGPTApiProvider';

export type AIProviderName = 'codex' | 'chatgpt-api';

export function getAIProviderFromEnv(env = process.env): AIProvider {
  const selected = (env.AI_PROVIDER ?? 'codex') as AIProviderName;

  switch (selected) {
    case 'chatgpt-api':
      return new ChatGPTApiProvider();
    case 'codex':
    default:
      return new CodexProvider();
  }
}
