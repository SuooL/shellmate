import { Config, LLMProvider } from "../types";
import { OpenAIProvider } from "./openai";

export const createProvider = (providerName: string, config: Config): LLMProvider => {
  const providers = config.providers ?? {};
  switch (providerName) {
    case "openai":
      return new OpenAIProvider(providers.openai ?? {});
    default:
      throw new Error(`Unsupported provider: ${providerName}`);
  }
};
