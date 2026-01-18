import { OutputItem, SafetyWarning } from "./types";

type OutputPayload = {
  content: string;
  warnings: SafetyWarning[];
  json: boolean;
  blocked: boolean;
  mode: string;
  quiet: boolean;
};

const extractCommands = (content: string): OutputItem[] => {
  const fenced = content.match(/```[a-z]*\n([\s\S]*?)```/i);
  const commandText = fenced ? fenced[1] : content;
  const lines = commandText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"));
  return lines.map(line => ({ command: line }));
};

export const formatOutput = ({
  content,
  warnings,
  json,
  blocked,
  mode,
  quiet
}: OutputPayload): string => {
  const items = extractCommands(content);
  if (json) {
    return JSON.stringify(
      {
        mode,
        output: content,
        items,
        warnings,
        blocked
      },
      null,
      2
    );
  }

  if (quiet) {
    return items.map(item => item.command).join("\n").trim();
  }

  const warningBlock = warnings.length
    ? `\n# Safety warnings\n${warnings
        .map(warning => `- [${warning.level.toUpperCase()}] ${warning.message}`)
        .join("\n")}`
    : "";
  return `${content}${warningBlock}`.trim();
};
