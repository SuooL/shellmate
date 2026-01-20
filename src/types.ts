export type ProviderConfig = {
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  retries?: number;
};

export type Config = {
  defaultProvider?: string;
  defaultModel?: string;
  defaults?: {
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
    retries?: number;
  };
  providers?: Record<string, ProviderConfig>;
  safety?: {
    warnOnDangerousCommands?: boolean;
    blockOnVeryDangerous?: boolean;
  };
};

export type ModelOptions = {
  model: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  retries?: number;
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

export type SafetyWarning = {
  level: "low" | "medium" | "high";
  message: string;
};

export type ExecutorResult = {
  providerName: string;
  model: string;
  mode: string;
  output: string;
};

export type OutputItem = {
  command: string;
  category?: "diagnostic" | "fix" | "command";
};
