import { LLMProvider, ModelOptions, Prompt, LLMResponse, ProviderConfig } from "../types";

export class StubProvider implements LLMProvider {
  name: string;

  constructor(private providerName: string, _config: ProviderConfig) {
    this.name = providerName;
  }

  async generate(_prompt: Prompt, _options: ModelOptions): Promise<LLMResponse> {
    throw new Error(`Provider "${this.name}" is not implemented yet.`);
  }
}
