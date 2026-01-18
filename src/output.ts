import { SafetyWarning } from "./types";

type OutputPayload = {
  content: string;
  warnings: SafetyWarning[];
  json: boolean;
  blocked: boolean;
};

export const formatOutput = ({ content, warnings, json, blocked }: OutputPayload): string => {
  if (json) {
    return JSON.stringify(
      {
        output: content,
        warnings,
        blocked
      },
      null,
      2
    );
  }

  const warningBlock = warnings.length
    ? `\n# Safety warnings\n${warnings
        .map(warning => `- [${warning.level.toUpperCase()}] ${warning.message}`)
        .join("\n")}`
    : "";
  return `${content}${warningBlock}`.trim();
};
