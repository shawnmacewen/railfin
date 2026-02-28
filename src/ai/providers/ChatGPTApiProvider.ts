import type { AIProvider } from './AIProvider';

type ChatMessage = {
  role: 'system' | 'user';
  content: string;
};

function parseTimeoutMs(raw: string | undefined, fallbackMs: number): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallbackMs;
  }
  return Math.trunc(parsed);
}

async function callChatCompletions(options: {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
  messages: ChatMessage[];
}): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetch(`${options.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: options.messages,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`ChatGPT provider request failed (${response.status}): ${body.slice(0, 300)}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };

    const content = payload.choices?.[0]?.message?.content;

    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('ChatGPT provider returned an empty completion.');
    }

    return content;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`ChatGPT provider timed out after ${options.timeoutMs}ms.`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export class ChatGPTApiProvider implements AIProvider {
  async complete(prompt: string): Promise<string> {
    const apiKey = process.env.CHATGPT_API_KEY ?? process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('ChatGPT provider is missing API key (CHATGPT_API_KEY or OPENAI_API_KEY).');
    }

    const baseUrl = process.env.CHATGPT_API_BASE_URL ?? 'https://api.openai.com/v1';
    const model = process.env.CHATGPT_API_MODEL ?? 'gpt-4o-mini';
    const timeoutMs = parseTimeoutMs(process.env.AI_PROVIDER_TIMEOUT_MS, 8000);

    return callChatCompletions({
      apiKey,
      baseUrl,
      model,
      timeoutMs,
      messages: [
        {
          role: 'system',
          content: 'Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
  }
}
