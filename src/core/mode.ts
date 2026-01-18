import { PromptMode } from "../prompts";

export const hasErrorIndicators = (text: string): boolean => {
  return /(error|failed|permission denied|no such file|not found|traceback|command not found|syntax error)/i.test(
    text
  );
};

export const looksLikeCommand = (text: string): boolean => {
  if (/[|><]/.test(text) || /--\w+/.test(text) || /\s-\w/.test(text)) {
    return true;
  }
  return /^\s*(git|ls|cd|cat|grep|find|tar|curl|wget|docker|npm|yarn|pnpm|node|python|rg|fd|ssh|scp|rsync)\b/i.test(
    text
  );
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
