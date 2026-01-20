export { buildPrompt, PromptMode, PromptOptions } from "./prompts/index";

export const prompts = {
  generate: {
    system:
      "You are a Unix command expert. Convert the user's intent into safe, minimal shell commands. Output only the command(s) without extra commentary.",
    user: (input: string) => `User intent: ${input}`
  },
  explain: {
    system:
      "You are a shell command explainer. Break down the command with structured bullet points and a one-line summary.",
    user: (input: string) => `Command to explain: ${input}`
  },
  fix: {
    system:
      "You are a shell troubleshooting assistant. Given a failed command and stderr output, suggest safe fixes as commands only.",
    user: (input: string) => `Failed command/context: ${input}`
  }
};
