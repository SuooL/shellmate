import { PromptMode } from "./prompts/index";
import { SafetyWarning } from "./types";

type OutputPayload = {
  content: string;
  warnings: SafetyWarning[];
  json: boolean;
  blocked: boolean;
  mode: PromptMode;
  quiet: boolean;
};

const extractCodeBlocks = (content: string): string[] => {
  const blocks: string[] = [];
  const regex = /```(?:\w+)?\n([\s\S]*?)```/g;
  let match = regex.exec(content);
  while (match) {
    blocks.push(match[1] ?? "");
    match = regex.exec(content);
  }
  return blocks;
};

const extractCommands = (content: string): string[] => {
  const blocks = extractCodeBlocks(content);
  const commands = blocks.flatMap(block =>
    block
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => (line.startsWith("`") && line.endsWith("`") ? line.slice(1, -1) : line))
  );
  if (commands.length > 0) {
    return commands;
  }
  return content
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#") && !line.startsWith("-"));
};

const extractSection = (content: string, heading: string): string => {
  const regex = new RegExp(`#\\s*${heading}\\b[\\s\\S]*?(?=\\n#\\s|$)`, "i");
  const match = content.match(regex);
  return match ? match[0] : "";
};

const extractListItems = (section: string): string[] =>
  section
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.startsWith("- ") || line.startsWith("* "))
    .map(line => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

export const formatOutput = ({ content, warnings, json, blocked, mode, quiet }: OutputPayload): string => {
  const warningBlock = warnings.length
    ? `\n# Safety warnings\n${warnings.map(warning => `- [${warning.level}] ${warning.message}`).join("\n")}`
    : "";

  if (quiet && !json) {
    return extractCommands(content).join("\n");
  }

  if (json) {
    const payloadBase = {
      mode,
      blocked,
      warnings
    };

    if (mode === "fix") {
      const causesSection = extractSection(content, "Possible causes");
      const diagnosticsSection = extractSection(content, "Diagnostics");
      const fixesSection = extractSection(content, "Fixes");
      const fallbackCommands = extractCommands(content).map(command => ({ command }));
      const diagnostics = extractCommands(diagnosticsSection).map(command => ({ command }));
      const fixes = extractCommands(fixesSection).map(command => ({ command }));
      return JSON.stringify(
        {
          ...payloadBase,
          fix: {
            causes: extractListItems(causesSection),
            diagnostics,
            fixes: fixes.length > 0 ? fixes : fallbackCommands
          }
        },
        null,
        2
      );
    }

    if (mode === "generate" || mode === "refactor" || mode === "suggest") {
      const items = extractCommands(content).map(command => ({ command }));
      return JSON.stringify(
        {
          ...payloadBase,
          items
        },
        null,
        2
      );
    }

    return JSON.stringify(
      {
        ...payloadBase,
        output: content
      },
      null,
      2
    );
  }

  return `${content}${warningBlock}`.trim();
};
