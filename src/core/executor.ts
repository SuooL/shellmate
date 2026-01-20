import { loadConfig, resolveConfig } from "../config";
import { formatOutput } from "../output";
import { PromptMode, buildPrompt } from "../prompts/index";
import { createProvider } from "../providers";
import { Config, ExecutorResult } from "../types";
import { detectSafety, hasHighRisk } from "./safety";

export type ExecutorOptions = {
  input: string;
  mode: PromptMode;
  providerName?: string;
  model?: string;
  json: boolean;
  verbose: boolean;
  detail?: boolean;
  quiet?: boolean;
  configPath?: string;
};

export const resolveExecutionConfig = (configPath?: string): Config => {
  const baseConfig = loadConfig(configPath);
  return resolveConfig(baseConfig);
};

export const execute = async (options: ExecutorOptions): Promise<ExecutorResult> => {
  const config = resolveExecutionConfig(options.configPath);
  const providerName = options.providerName ?? config.defaultProvider ?? "openai";
  const providerConfig = config.providers?.[providerName];
  const model = options.model ?? providerConfig?.model ?? config.defaultModel ?? "gpt-4.1";
  const provider = createProvider(providerName, config);

  const prompt = buildPrompt(options.mode, options.input, { detail: options.detail });
  const response = await provider.generate(
    {
      system: prompt.system,
      user: prompt.user
    },
    { model }
  );

  const warnings = config.safety?.warnOnDangerousCommands ? detectSafety(response.text) : [];
  const shouldBlock = config.safety?.blockOnVeryDangerous && hasHighRisk(warnings);

  const output = shouldBlock
    ? formatOutput({
        content: "Output blocked due to high-risk command detection.",
        warnings,
        json: options.json,
        blocked: true,
        mode: options.mode,
        quiet: Boolean(options.quiet)
      })
    : formatOutput({
        content: response.text,
        warnings,
        json: options.json,
        blocked: false,
        mode: options.mode,
        quiet: Boolean(options.quiet)
      });

  return {
    providerName: provider.name,
    model,
    output
  };
};
