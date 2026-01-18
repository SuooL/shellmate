export type ProviderConfig = {
  apiKey?: string;
  baseUrl?: string;
};

export type Config = {
  defaultProvider?: string;
  defaultModel?: string;
  providers?: Record<string, ProviderConfig>;
  safety?: {
    warnOnDangerousCommands?: boolean;
  };
};

export type ModelOptions = {
  model: string;
};

export type Prompt = {
  system: string;
  user: string;
};

export type LLMResponse = {
  text: string;
};

export type LLMProvider = {
  name: string;
  generate: (prompt: Prompt, options: ModelOptions) => Promise<LLMResponse>;
};
