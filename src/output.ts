type OutputPayload = {
  content: string;
  warnings: string[];
  json: boolean;
};

export const formatOutput = ({ content, warnings, json }: OutputPayload): string => {
  if (json) {
    return JSON.stringify(
      {
        output: content,
        warnings
      },
      null,
      2
    );
  }

  const warningBlock = warnings.length
    ? `\n# Safety warnings\n${warnings.map(warning => `- ${warning}`).join("\n")}`
    : "";
  return `${content}${warningBlock}`.trim();
};
