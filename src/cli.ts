#!/usr/bin/env node
import { Command } from "commander";
import { PromptMode } from "./prompts";
import { readStdin } from "./utils";
import { execute } from "./core/executor";
import { detectAutoMode } from "./core/mode";

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
  json: boolean;
  verbose: boolean;
  configPath?: string;
}): Promise<void> => {
  const result = await execute({
    input: options.input,
    mode: options.promptKey,
    providerName: options.providerName,
    model: options.model,
    json: options.json,
    verbose: options.verbose,
    configPath: options.configPath
  });

  logVerbose(options.verbose, `Provider: ${result.providerName}`);
  logVerbose(options.verbose, `Model: ${result.model}`);
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
      json: Boolean(options.json),
      verbose: Boolean(options.verbose),
      configPath: options.config
    });
  });

program.parseAsync(process.argv);
