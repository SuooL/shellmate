import { Config, LLMProvider } from "../types";
import { OpenAIProvider } from "./openai";
import { StubProvider } from "./stub";

export const createProvider = (providerName: string, config: Config): LLMProvider => {
  const providers = config.providers ?? {};
  switch (providerName) {
    case "openai":
      return new OpenAIProvider(providers.openai ?? {});
    case "claude":
    case "gemini":
    case "qwen":
    case "chatglm":
      return new StubProvider(providerName, providers[providerName] ?? {});
    default:
      throw new Error(`Unsupported provider: ${providerName}`);
  }
};
