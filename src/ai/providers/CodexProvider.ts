import type { AIProvider } from './AIProvider';

export class CodexProvider implements AIProvider {
  async complete(_prompt: string): Promise<string> {
    throw new Error('CodexProvider stub: not implemented');
  }
}
