#!/usr/bin/env node
import { Command } from "commander";
import { loadConfig, resolveConfig } from "./config";
import { createProvider } from "./providers";
import { buildPrompt, PromptMode } from "./prompts";
import { detectDangerous, readStdin } from "./utils";
import { formatOutput } from "./output";

const program = new Command();

const logVerbose = (enabled: boolean, message: string) => {
  if (enabled) {
    console.log(message);
  }
};

const resolveInput = async (
  args: string[]
): Promise<{ input: string; fromStdin: boolean }> => {
  if (args.length > 0) {
    return { input: args.join(" ").trim(), fromStdin: false };
  }
  if (process.stdin.isTTY) {
    return { input: "", fromStdin: false };
  }
  const input = await readStdin();
  return { input, fromStdin: true };
};

const hasErrorIndicators = (text: string): boolean => {
  return /(error|failed|permission denied|no such file|not found|traceback)/i.test(text);
};

const looksLikeCommand = (text: string): boolean => {
  if (/[|><]/.test(text) || /--\w+/.test(text) || /\s-\w/.test(text)) {
    return true;
  }
  return /^\s*(git|ls|cd|cat|grep|find|tar|curl|wget|docker|npm|yarn|pnpm|node|python|rg|fd|ssh|scp|rsync)\b/i.test(
    text
  );
};

const detectAutoMode = (input: string, fromStdin: boolean): PromptMode => {
  if (fromStdin || hasErrorIndicators(input)) {
    return "fix";
  }
  if (looksLikeCommand(input)) {
    return "explain";
  }
  return "generate";
};

const runWithProvider = async (options: {
  input: string;
  promptKey: PromptMode;
  providerName?: string;
  model?: string;
  json: boolean;
  verbose: boolean;
  configPath?: string;
}): Promise<void> => {
  const baseConfig = loadConfig(options.configPath);
  const config = resolveConfig(baseConfig);
  const providerName = options.providerName ?? config.defaultProvider ?? "openai";
  const model = options.model ?? config.defaultModel ?? "gpt-4.1";
  const provider = createProvider(providerName, config);

  logVerbose(options.verbose, `Provider: ${provider.name}`);
  logVerbose(options.verbose, `Model: ${model}`);

  const promptTemplate = buildPrompt(options.promptKey, options.input);
  const response = await provider.generate(
    {
      system: promptTemplate.system,
      user: promptTemplate.user
    },
    { model }
  );

  const warnings = config.safety?.warnOnDangerousCommands
    ? detectDangerous(response.text)
    : [];

  const output = formatOutput({
    content: response.text,
    warnings,
    json: options.json
  });

  console.log(output);
};

program
  .name("shellmate")
  .description("A cross-platform AI-assisted command line companion.")
  .alias("sm")
  .option("--model <name>", "Specify a model")
  .option("--provider <name>", "Specify a provider")
  .option("--config <path>", "Specify config path")
  .option("--json", "Output JSON")
  .option("--verbose", "Verbose logging");

program
  .command("gen")
  .description("Generate shell commands from natural language")
  .argument("[intent...]", "Natural language intent")
  .action(async (intent: string[], cmd: Command) => {
    const options = cmd.parent?.opts() ?? {};
    const { input } = await resolveInput(intent);
    if (!input) {
      console.error("No input provided.");
      process.exit(1);
    }

    await runWithProvider({
      input,
      promptKey: "generate",
      providerName: options.provider,
      model: options.model,
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      configPath: options.config
    });
  });

program
  .command("explain")
  .description("Explain a shell command")
  .argument("[command...]", "Command to explain")
  .action(async (commandParts: string[], cmd: Command) => {
    const options = cmd.parent?.opts() ?? {};
    const { input } = await resolveInput(commandParts);
    if (!input) {
      console.error("No command provided.");
      process.exit(1);
    }

    await runWithProvider({
      input,
      promptKey: "explain",
      providerName: options.provider,
      model: options.model,
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      configPath: options.config
    });
  });

program
  .command("fix")
  .description("Suggest fixes for failed commands")
  .argument("[context...]", "Command and error output")
  .action(async (context: string[], cmd: Command) => {
    const options = cmd.parent?.opts() ?? {};
    const { input } = await resolveInput(context);
    if (!input) {
      console.error("No error context provided.");
      process.exit(1);
    }

    await runWithProvider({
      input,
      promptKey: "fix",
      providerName: options.provider,
      model: options.model,
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      configPath: options.config
    });
  });

program
  .argument("[input...]", "Auto mode: intent, command, or error output")
  .action(async (inputArgs: string[]) => {
    const options = program.opts();
    const { input, fromStdin } = await resolveInput(inputArgs);
    if (!input) {
      console.error("No input provided.");
      process.exit(1);
    }

    const mode = detectAutoMode(input, fromStdin);
    await runWithProvider({
      input,
      promptKey: mode,
      providerName: options.provider,
      model: options.model,
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      configPath: options.config
    });
  });

program.parseAsync(process.argv);
