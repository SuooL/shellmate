import { OutputItem, SafetyWarning } from "./types";

type OutputPayload = {
  content: string;
  warnings: SafetyWarning[];
  json: boolean;
  blocked: boolean;
  mode: string;
  quiet: boolean;
};

const extractCommands = (content: string, category: OutputItem["category"] = "command"): OutputItem[] => {
  const fenced = content.match(/```[a-z]*\n([\s\S]*?)```/i);
  const commandText = fenced ? fenced[1] : content;
  const lines = commandText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"));
  return lines.map(line => ({ command: line.replace(/^[-*]\s*/, ""), category }));
};

const parseFixSections = (content: string): {
  causes: string[];
  diagnostics: OutputItem[];
  fixes: OutputItem[];
} => {
  const sections = content.split(/\n(?=#\s+)/g);
  const causes: string[] = [];
  let diagnostics: OutputItem[] = [];
  let fixes: OutputItem[] = [];

  for (const section of sections) {
    const headingMatch = section.match(/^#\s+(.*)/);
    if (!headingMatch) {
      continue;
    }
    const heading = headingMatch[1]?.trim().toLowerCase();
    const body = section.replace(/^#\s+.*\n?/, "").trim();
    if (heading?.includes("possible causes")) {
      const lines = body
        .split("\n")
        .map(line => line.trim())
        .filter(line => line);
      for (const line of lines) {
        causes.push(line.replace(/^[-*]\s*/, ""));
      }
    } else if (heading?.includes("diagnostic")) {
      diagnostics = diagnostics.concat(extractCommands(body, "diagnostic"));
    } else if (heading?.includes("fix")) {
      fixes = fixes.concat(extractCommands(body, "fix"));
    }
  }

  return { causes, diagnostics, fixes };
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
  const fixSections = mode === "fix" ? parseFixSections(content) : null;
  if (json) {
    return JSON.stringify(
      {
        mode,
        output: content,
        items,
        fix: fixSections,
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
