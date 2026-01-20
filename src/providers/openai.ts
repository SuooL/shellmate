import { LLMProvider, LLMResponse, ModelOptions, Prompt } from "../types";

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
      throw new Error("Missing OpenAI API key. Set it in config or OPENAI_API_KEY.");
    }
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
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI response missing content.");
    }

    return { text: content.trim() };
  }
}
