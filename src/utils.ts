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

const dangerousPatterns: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /\brm\s+-rf\b/i, message: "HIGH RISK: recursive delete (rm -rf)." },
  { pattern: /\bdd\b/i, message: "HIGH RISK: raw disk write (dd)." },
  { pattern: /\bmkfs\b/i, message: "HIGH RISK: filesystem creation (mkfs)." },
  { pattern: /\bchmod\s+-R\b/i, message: "MEDIUM RISK: recursive permissions change." },
  { pattern: /\bchown\s+-R\b/i, message: "MEDIUM RISK: recursive ownership change." },
  { pattern: /\bcurl\b.*\|\s*(sh|bash)\b/i, message: "HIGH RISK: piping network data to shell." },
  { pattern: /\bwget\b.*\|\s*(sh|bash)\b/i, message: "HIGH RISK: piping network data to shell." }
];

export const detectDangerous = (text: string): string[] => {
  const warnings: string[] = [];
  for (const entry of dangerousPatterns) {
    if (entry.pattern.test(text)) {
      warnings.push(entry.message);
    }
  }
  return warnings;
};
