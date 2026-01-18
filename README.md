# Shellmate

Shellmate is a cross-platform AI-assisted command line companion. It converts natural language into shell command suggestions, explains commands, and offers fixes for failed commands. Shellmate never executes commands; it only proposes them for you to review.

## Features

- **Generate** shell commands from natural language.
- **Explain** existing commands with structured breakdowns.
- **Fix** failed commands by suggesting safer alternatives.
- **Model-agnostic** provider abstraction (OpenAI included).
- **Auto mode** to infer generate/explain/fix from a single input.
- **Safety warnings** for high-risk commands.

## Installation

```bash
npm install -g shellmate
```

## Quick Start

```bash
shellmate "Find the 10 largest files in the current directory"

shellmate explain "tar -xzvf file.tar.gz"

git push 2>&1 | shellmate

shellmate fix "ls /missing/path" \
  "ls: cannot access '/missing/path': No such file or directory"
```

## CLI Reference

```bash
shellmate <command> [options]
```

### Commands

- `shellmate "..."` – Auto mode (infer generate/explain/fix).
- `gen` – Generate commands from natural language.
- `explain` – Explain a command.
- `fix` – Suggest fixes for a failed command.

### Global Options

- `--model <name>` – Specify a model (e.g. `gpt-4.1`).
- `--provider <name>` – Specify a provider (e.g. `openai`).
- `--config <path>` – Use a specific config file.
- `--json` – Output JSON.
- `--verbose` – Verbose logging.

## Configuration

Default config location:

```
~/.shellmate/config.json
```

Example config:

```json
{
  "defaultProvider": "openai",
  "defaultModel": "gpt-4.1",
  "providers": {
    "openai": {
      "apiKey": "ENV:OPENAI_API_KEY",
      "baseUrl": "https://api.openai.com/v1"
    }
  },
  "safety": {
    "warnOnDangerousCommands": true
  }
}
```

## Prompts

Prompt templates live in `src/prompts/` and are loaded at runtime. `core.md` contains shared rules, while mode-specific files (`generate.md`, `explain.md`, `fix.md`, etc.) define task-specific behavior.

## Providers

OpenAI is implemented. Additional providers (`claude`, `gemini`, `qwen`, `chatglm`) are registered as stubs to reserve the interface.

## Development

```bash
npm install
npm run build
```

## Safety

Shellmate will warn when model output appears to include risky commands such as `rm -rf`, `dd`, or `chmod -R`. It never executes any command automatically.
