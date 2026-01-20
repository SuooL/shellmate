#!/usr/bin/env node
import { Command } from "commander";
import { detectAutoMode } from "./core/mode";
import { execute } from "./core/executor";
import { PromptMode } from "./prompts/index";
import { readStdin } from "./utils";

const program = new Command();

const logVerbose = (enabled: boolean, message: string) => {
  if (enabled) {
    console.log(message);
  }
};

const resolveInput = async (args: string[]): Promise<{ input: string; fromStdin: boolean }> => {
  if (args.length > 0) {
    return { input: args.join(" ").trim(), fromStdin: false };
  }
  const fromStdin = !process.stdin.isTTY;
  const input = await readStdin();
  return { input, fromStdin };
};

const normalizeMode = (value?: string): PromptMode | "auto" | undefined => {
  if (!value) {
    return undefined;
  }
  switch (value) {
    case "auto":
    case "generate":
    case "explain":
    case "fix":
    case "refactor":
    case "suggest":
      return value;
    default:
      return undefined;
  }
};

const runMode = async (options: {
  input: string;
  mode: PromptMode;
  providerName?: string;
  model?: string;
  json: boolean;
  verbose: boolean;
  detail: boolean;
  quiet: boolean;
  configPath?: string;
}): Promise<void> => {
  const result = await execute({
    input: options.input,
    mode: options.mode,
    providerName: options.providerName,
    model: options.model,
    json: options.json,
    verbose: options.verbose,
    detail: options.detail,
    quiet: options.quiet,
    configPath: options.configPath
  });

  logVerbose(options.verbose, `Provider: ${result.providerName}`);
  logVerbose(options.verbose, `Model: ${result.model}`);
  logVerbose(options.verbose, `Mode: ${options.mode}`);
  console.log(result.output);
};

program
  .name("shellmate")
  .description("A cross-platform AI-assisted command line companion.")
  .option("--model <name>", "Specify a model")
  .option("--provider <name>", "Specify a provider")
  .option("--config <path>", "Specify config path")
  .option("--json", "Output JSON")
  .option("--verbose", "Verbose logging")
  .option("--detail", "More detailed explanations")
  .option("--quiet", "Output only commands")
  .option("--mode <mode>", "Force mode: auto|generate|explain|fix|refactor|suggest");

program
  .argument("[input...]", "Auto mode input")
  .action(async (inputParts: string[]) => {
    const options = program.opts();
    const { input, fromStdin } = await resolveInput(inputParts);
    if (!input) {
      console.error("No input provided.");
      process.exit(1);
    }

    const normalizedMode = normalizeMode(options.mode);
    const mode =
      normalizedMode && normalizedMode !== "auto"
        ? normalizedMode
        : detectAutoMode(input, fromStdin);

    await runMode({
      input,
      mode,
      providerName: options.provider,
      model: options.model,
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      detail: Boolean(options.detail),
      quiet: Boolean(options.quiet),
      configPath: options.config
    });
  });

program
  .command("gen")
  .description("Generate shell commands from natural language")
  .argument("[intent...]", "Natural language intent")
  .action(async (intent: string[], cmd: Command) => {
    const options = cmd.parent?.opts() ?? {};
    const resolved = await resolveInput(intent);
    const input = resolved.input;
    if (!input) {
      console.error("No input provided.");
      process.exit(1);
    }

    await runMode({
      input,
      mode: "generate",
      providerName: options.provider,
      model: options.model,
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      detail: Boolean(options.detail),
      quiet: Boolean(options.quiet),
      configPath: options.config
    });
  });

program
  .command("explain")
  .description("Explain a shell command")
  .argument("[command...]", "Command to explain")
  .action(async (commandParts: string[], cmd: Command) => {
    const options = cmd.parent?.opts() ?? {};
    const resolved = await resolveInput(commandParts);
    const input = resolved.input;
    if (!input) {
      console.error("No command provided.");
      process.exit(1);
    }

    await runMode({
      input,
      mode: "explain",
      providerName: options.provider,
      model: options.model,
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      detail: Boolean(options.detail),
      quiet: Boolean(options.quiet),
      configPath: options.config
    });
  });

program
  .command("fix")
  .description("Suggest fixes for failed commands")
  .argument("[context...]", "Command and error output")
  .action(async (context: string[], cmd: Command) => {
    const options = cmd.parent?.opts() ?? {};
    const resolved = await resolveInput(context);
    const input = resolved.input;
    if (!input) {
      console.error("No error context provided.");
      process.exit(1);
    }

    await runMode({
      input,
      mode: "fix",
      providerName: options.provider,
      model: options.model,
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      detail: Boolean(options.detail),
      quiet: Boolean(options.quiet),
      configPath: options.config
    });
  });

program.parseAsync(process.argv);
