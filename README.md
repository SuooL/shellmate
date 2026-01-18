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
export OPENAI_API_KEY="your-api-key"

shellmate "Find the 10 largest files in the current directory"

shellmate explain "tar -xzvf file.tar.gz"

git push 2>&1 | shellmate

shellmate fix "ls /missing/path" \
  "ls: cannot access '/missing/path': No such file or directory"

# Force a mode
shellmate --mode explain "tar -xzvf file.tar.gz"

# Copy output to clipboard
shellmate gen "List CSV files" --copy
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
- `--mode <mode>` – Force mode (`auto|generate|fix|explain|refactor|suggest`).
- `--temperature <value>` – Sampling temperature.
- `--max-tokens <value>` – Max tokens to generate.
- `--timeout-ms <value>` – Request timeout in milliseconds.
- `--retries <value>` – Retry attempts for provider requests.
- `--detail` – More detailed explanations (explain mode).
- `--json` – Output JSON.
- `--quiet` – Print commands only.
- `--copy` – Copy output to clipboard.
- `--verbose` – Verbose logging.

JSON output includes `mode`, `output`, `items` (parsed commands), `warnings`, and `blocked`.

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
  "defaults": {
    "temperature": 0.2,
    "maxTokens": 500,
    "timeoutMs": 10000,
    "retries": 1
  },
  "providers": {
    "openai": {
      "apiKey": "ENV:OPENAI_API_KEY",
      "baseUrl": "https://api.openai.com/v1",
      "timeoutMs": 10000
    }
  },
  "safety": {
    "warnOnDangerousCommands": true,
    "blockOnVeryDangerous": false
  }
}
```

## Config doctor

```bash
shellmate config doctor
```

## Fix helpers

```bash
# Read from stdin explicitly
some_command 2>&1 | shellmate fix --stdin

# Paste mode (end with Ctrl-D)
shellmate fix --paste
```

## Prompts

Prompt templates live in `src/prompts/` and are loaded at runtime. `core.md` contains shared rules, while mode-specific files (`generate.md`, `explain.md`, `fix.md`, etc.) define task-specific behavior.

## Providers

OpenAI is implemented. Additional providers (`claude`, `gemini`, `qwen`, `chatglm`) are registered as stubs to reserve the interface.

Provider switch example:

```bash
shellmate gen "List recent PDFs" --provider openai --model gpt-4.1
```

## Development

```bash
npm install
npm run build
```

## Safety

Shellmate will warn when model output appears to include risky commands such as `rm -rf`, `dd`, or `chmod -R`. It never executes any command automatically.
