import { PromptMode } from "../prompts/index";

export const hasErrorIndicators = (text: string): boolean => {
  return /(error|failed|permission denied|no such file|not found|traceback|command not found|syntax error)/i.test(
    text
  );
};

export const looksLikeCommand = (text: string): boolean => {
  if (/[|><]/.test(text) || /--\w+/.test(text) || /\s-\w/.test(text)) {
    return true;
  }
  const trimmed = text.trim();
  const tokens = trimmed.split(/\s+/);
  const commandPattern =
    /^(git|ls|cd|cat|grep|find|tar|curl|wget|docker|npm|yarn|pnpm|node|python|rg|fd|ssh|scp|rsync)$/i;

  if (!commandPattern.test(tokens[0] ?? "")) {
    return false;
  }

  if (tokens.length <= 2) {
    return true;
  }

  return tokens.slice(1).some(token => /[./~]/.test(token) || token.startsWith("-"));
};

export const detectAutoMode = (input: string, fromStdin: boolean): PromptMode => {
  if (fromStdin || hasErrorIndicators(input)) {
    return "fix";
  }
  if (looksLikeCommand(input)) {
    return "explain";
  }
  return "generate";
};
