import process from "process";

export const readStdin = async (): Promise<string> => {
  const chunks: Buffer[] = [];
  return new Promise(resolve => {
    process.stdin.on("data", chunk => chunks.push(Buffer.from(chunk)));
    process.stdin.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8").trim());
    });
    process.stdin.resume();
  });
};

const dangerousPatterns = [/\brm\s+-rf\b/i, /\bdd\b/i, /\bchmod\s+-R\b/i];

export const detectDangerous = (text: string): string[] => {
  const warnings: string[] = [];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      warnings.push(`Detected dangerous command pattern: ${pattern.source}`);
    }
  }
  return warnings;
};
