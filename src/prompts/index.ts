import fs from "fs";
import path from "path";
import { Prompt } from "../types";

const modeFiles = {
  generate: "generate.md",
  explain: "explain.md",
  fix: "fix.md",
  refactor: "refactor.md",
  suggest: "suggest.md"
} as const;

export type PromptMode = keyof typeof modeFiles;

const resolvePromptDir = (): string => {
  const candidates = [
    path.resolve(__dirname, "..", "prompts"),
    path.resolve(process.cwd(), "src", "prompts"),
    path.resolve(process.cwd(), "prompts")
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error("Unable to locate prompts directory.");
};

const promptCache = new Map<string, string>();

const loadPrompt = (fileName: string): string => {
  const cacheKey = fileName;
  const cached = promptCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promptDir = resolvePromptDir();
  const filePath = path.join(promptDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt file not found: ${fileName}`);
  }

  const content = fs.readFileSync(filePath, "utf8").trim();
  promptCache.set(cacheKey, content);
  return content;
};

export const buildPrompt = (mode: PromptMode, input: string): Prompt => {
  const core = loadPrompt("core.md");
  const modePrompt = loadPrompt(modeFiles[mode]);

  return {
    system: `${core}\n\n${modePrompt}`.trim(),
    user: input.trim()
  };
};
