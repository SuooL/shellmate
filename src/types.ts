export type ProviderConfig = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
};

export type Config = {
  defaultProvider?: string;
  defaultModel?: string;
  providers?: Record<string, ProviderConfig>;
  safety?: {
    warnOnDangerousCommands?: boolean;
    blockOnVeryDangerous?: boolean;
  };
};

export type SafetyWarning = {
  level: "low" | "medium" | "high";
  message: string;
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

export type ExecutorResult = {
  providerName: string;
  model: string;
  output: string;
};
