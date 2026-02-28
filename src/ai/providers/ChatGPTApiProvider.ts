import type { AIProvider } from './AIProvider';

export class ChatGPTApiProvider implements AIProvider {
  async complete(_prompt: string): Promise<string> {
    throw new Error('ChatGPTApiProvider stub: not implemented');
  }
}
