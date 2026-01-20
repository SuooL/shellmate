#!/usr/bin/env node
import { Command } from "commander";
import { PromptMode } from "./prompts";
import { copyToClipboard, readStdin } from "./utils";
import { execute } from "./core/executor";
import { detectAutoMode } from "./core/mode";
import { runConfigDoctor } from "./core/doctor";

const program = new Command();
const allowedModes: Array<PromptMode | "auto"> = [
  "auto",
  "generate",
  "explain",
  "fix",
  "refactor",
  "suggest"
];

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

const runWithProvider = async (options: {
  input: string;
  promptKey: PromptMode;
  providerName?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  retries?: number;
  detail: boolean;
  json: boolean;
  verbose: boolean;
  quiet: boolean;
  copy: boolean;
  configPath?: string;
}): Promise<void> => {
  const sanitizeNumber = (value?: number): number | undefined =>
    typeof value === "number" && Number.isFinite(value) ? value : undefined;

  const result = await execute({
    input: options.input,
    mode: options.promptKey,
    providerName: options.providerName,
    model: options.model,
    temperature: sanitizeNumber(options.temperature),
    maxTokens: sanitizeNumber(options.maxTokens),
    timeoutMs: sanitizeNumber(options.timeoutMs),
    retries: sanitizeNumber(options.retries),
    detail: options.detail,
    json: options.json,
    verbose: options.verbose,
    quiet: options.quiet,
    configPath: options.configPath
  });

  logVerbose(options.verbose, `Provider: ${result.providerName}`);
  logVerbose(options.verbose, `Model: ${result.model}`);
  logVerbose(options.verbose, `Mode: ${result.mode}`);
  if (options.copy) {
    try {
      await copyToClipboard(result.output);
    } catch (error) {
      console.error(`Failed to copy output: ${(error as Error).message}`);
    }
  }
  console.log(result.output);
};

program
  .name("shellmate")
  .description("A cross-platform AI-assisted command line companion.")
  .alias("sm")
  .option("--model <name>", "Specify a model")
  .option("--provider <name>", "Specify a provider")
  .option("--config <path>", "Specify config path")
  .option("--mode <mode>", "Force mode: auto|generate|fix|explain|refactor|suggest")
  .option("--temperature <value>", "Sampling temperature", value => Number(value))
  .option("--max-tokens <value>", "Maximum tokens to generate", value => Number(value))
  .option("--timeout-ms <value>", "Request timeout in milliseconds", value => Number(value))
  .option("--retries <value>", "Retry attempts for provider requests", value => Number(value))
  .option("--detail", "Include more detailed explanations (explain mode)")
  .option("--json", "Output JSON")
  .option("--quiet", "Print commands only")
  .option("--copy", "Copy output to clipboard")
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
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      timeoutMs: options.timeoutMs,
      retries: options.retries,
      detail: Boolean(options.detail),
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      quiet: Boolean(options.quiet),
      copy: Boolean(options.copy),
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
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      timeoutMs: options.timeoutMs,
      retries: options.retries,
      detail: Boolean(options.detail),
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      quiet: Boolean(options.quiet),
      copy: Boolean(options.copy),
      configPath: options.config
    });
  });

program
  .command("fix")
  .description("Suggest fixes for failed commands")
  .argument("[context...]", "Command and error output")
  .option("--stdin", "Read error context from stdin")
  .option("--paste", "Paste mode (read from stdin until EOF)")
  .action(async (context: string[], cmd: Command) => {
    const options = cmd.parent?.opts() ?? {};
    const useStdin = Boolean(cmd.opts().stdin || cmd.opts().paste);
    if (useStdin && cmd.opts().paste && process.stdin.isTTY) {
      console.error("Paste error output, then press Ctrl-D to finish:");
    }
    const { input } = useStdin ? { input: await readStdin() } : await resolveInput(context);
    if (!input && useStdin) {
      console.error("No stdin content provided.");
      process.exit(1);
    }
    if (!input) {
      console.error("No error context provided.");
      process.exit(1);
    }

    await runWithProvider({
      input,
      promptKey: "fix",
      providerName: options.provider,
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      timeoutMs: options.timeoutMs,
      retries: options.retries,
      detail: Boolean(options.detail),
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      quiet: Boolean(options.quiet),
      copy: Boolean(options.copy),
      configPath: options.config
    });
  });

program
  .command("refactor")
  .description("Refactor a shell command to a simpler alternative")
  .argument("[command...]", "Command to refactor")
  .action(async (commandParts: string[], cmd: Command) => {
    const options = cmd.parent?.opts() ?? {};
    const { input } = await resolveInput(commandParts);
    if (!input) {
      console.error("No command provided.");
      process.exit(1);
    }

    await runWithProvider({
      input,
      promptKey: "refactor",
      providerName: options.provider,
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      timeoutMs: options.timeoutMs,
      retries: options.retries,
      detail: Boolean(options.detail),
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      quiet: Boolean(options.quiet),
      copy: Boolean(options.copy),
      configPath: options.config
    });
  });

program
  .command("suggest")
  .description("Suggest next commands based on context")
  .argument("[context...]", "Optional context")
  .action(async (contextParts: string[], cmd: Command) => {
    const options = cmd.parent?.opts() ?? {};
    const { input } = await resolveInput(contextParts);
    if (!input) {
      console.error("No context provided.");
      process.exit(1);
    }

    await runWithProvider({
      input,
      promptKey: "suggest",
      providerName: options.provider,
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      timeoutMs: options.timeoutMs,
      retries: options.retries,
      detail: Boolean(options.detail),
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      quiet: Boolean(options.quiet),
      copy: Boolean(options.copy),
      configPath: options.config
    });
  });

program
  .command("config")
  .description("Configuration helpers")
  .command("doctor")
  .description("Check configuration and provider connectivity")
  .action(async (cmd: Command) => {
    const options = cmd.parent?.parent?.opts() ?? {};
    const report = await runConfigDoctor({
      configPath: options.config,
      providerName: options.provider,
      model: options.model,
      timeoutMs: options.timeoutMs
    });
    console.log(report);
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

    const forcedMode = options.mode as PromptMode | "auto" | undefined;
    if (forcedMode && !allowedModes.includes(forcedMode)) {
      console.error(`Invalid mode: ${forcedMode}`);
      process.exit(1);
    }
    const mode = forcedMode === "auto" || !forcedMode ? detectAutoMode(input, fromStdin) : forcedMode;
    await runWithProvider({
      input,
      promptKey: mode,
      providerName: options.provider,
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      timeoutMs: options.timeoutMs,
      retries: options.retries,
      detail: Boolean(options.detail),
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      quiet: Boolean(options.quiet),
      copy: Boolean(options.copy),
      configPath: options.config
    });
  });

program.parseAsync(process.argv);
