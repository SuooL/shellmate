# Terpilot

Terpilot is a cross-platform AI-assisted command line companion. It converts natural language into shell command suggestions, explains commands, and offers fixes for failed commands. Terpilot never executes commands; it only proposes them for you to review.

## Features

- **Generate** shell commands from natural language.
- **Explain** existing commands with structured breakdowns.
- **Fix** failed commands by suggesting safer alternatives.
- **Model-agnostic** provider abstraction (OpenAI included).
- **Auto mode** to infer generate/explain/fix from a single input.
- **Safety warnings** for high-risk commands.

## Installation

```bash
npm install -g terpilot
```

## Quick Start

```bash

tep "Find the 10 largest files in the current directory"

tep explain "tar -xzvf file.tar.gz"

git push 2>&1 | tep

tep gen "Find the 10 largest files in the current directory"

tep explain "tar -xzvf file.tar.gz"

tep fix "ls /missing/path" \
  "ls: cannot access '/missing/path': No such file or directory"
```

## CLI Reference

```bash
terpilot <command> [options]
```

### Commands
- `terpilot "..."` – Auto mode (infer generate/explain/fix).
- `gen` – Generate commands from natural language.
- `explain` – Explain a command.
- `fix` – Suggest fixes for a failed command.

### Global Options

- `--model <name>` – Specify a model (e.g. `gpt-4.1`).
- `--provider <name>` – Specify a provider (e.g. `openai`).
- `--config <path>` – Use a specific config file.
- `--json` – Output JSON.
- `--mode <mode>` – Force mode: `auto|generate|explain|fix|refactor|suggest`.
- `--detail` – More detailed explanations (explain mode).
- `--quiet` – Output only commands.
- `--verbose` – Verbose logging.

## Configuration

Default config location:

```
~/.terpilot/config.json
```

If `./config.json` exists in the current working directory, Terpilot will use it by default.

Example config:

```json
{
  "defaultProvider": "openai",
  "defaultModel": "gpt-4.1",
  "providers": {
    "openai": {
      "apiKey": "ENV:OPENAI_API_KEY",
      "baseUrl": "https://api.openai.com/v1",
      "model": "gpt-4.1"
    }
  },
  "safety": {
    "warnOnDangerousCommands": true
  }
}
```

You can also set per-provider models and keep all providers in one file. Custom providers are supported if they expose an OpenAI-compatible API (set `baseUrl` for that provider). See `config.example.json`.

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

Terpilot will warn when model output appears to include risky commands such as `rm -rf`, `dd`, or `chmod -R`. It never executes any command automatically.
