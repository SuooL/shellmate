import { LLMProvider, LLMResponse, ModelOptions, Prompt } from "../types";
import { ProviderError } from "./errors";

type OpenAIConfig = {
  apiKey?: string;
  baseUrl?: string;
};

export class OpenAIProvider implements LLMProvider {
  name = "openai";
  private apiKey?: string;
  private baseUrl: string;

  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? "https://api.openai.com/v1";
  }

  async generate(prompt: Prompt, options: ModelOptions): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new ProviderError("auth", "Missing OpenAI API key. Set it in config or OPENAI_API_KEY.");
    }
    const retries = options.retries ?? 0;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 10000);
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: options.model,
            messages: [
              { role: "system", content: prompt.system },
              { role: "user", content: prompt.user }
            ],
            temperature: options.temperature ?? 0.2,
            max_tokens: options.maxTokens
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (!response.ok) {
          const errorBody = await response.text();
          if (response.status === 401 || response.status === 403) {
            throw new ProviderError("auth", `OpenAI auth failed: ${response.status} ${errorBody}`);
          }
          if (response.status === 429) {
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
              continue;
            }
            throw new ProviderError("rate_limit", `OpenAI rate limited: ${response.status} ${errorBody}`);
          }
          if (response.status >= 500 && attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
            continue;
          }
          throw new ProviderError("network", `OpenAI request failed: ${response.status} ${errorBody}`);
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new ProviderError("invalid_response", "OpenAI response missing content.");
        }

        return { text: content.trim() };
      } catch (error) {
        clearTimeout(timeout);
        if (error instanceof ProviderError) {
          throw error;
        }
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
          continue;
        }
        throw new ProviderError("network", (error as Error).message);
      }
    }

    throw new ProviderError("unknown", "OpenAI request failed.");
  }
}
