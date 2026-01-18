import { SafetyWarning } from "../types";

const safetyRules: Array<{ pattern: RegExp; level: SafetyWarning["level"]; message: string }> = [
  { pattern: /\brm\s+-rf\b/i, level: "high", message: "HIGH RISK: recursive delete (rm -rf)." },
  { pattern: /\bdd\b/i, level: "high", message: "HIGH RISK: raw disk write (dd)." },
  { pattern: /\bmkfs\b/i, level: "high", message: "HIGH RISK: filesystem creation (mkfs)." },
  { pattern: /\bchmod\s+-R\b/i, level: "medium", message: "MEDIUM RISK: recursive permissions change." },
  { pattern: /\bchown\s+-R\b/i, level: "medium", message: "MEDIUM RISK: recursive ownership change." },
  { pattern: /\bcurl\b.*\|\s*(sh|bash)\b/i, level: "high", message: "HIGH RISK: piping network data to shell." },
  { pattern: /\bwget\b.*\|\s*(sh|bash)\b/i, level: "high", message: "HIGH RISK: piping network data to shell." },
  { pattern: />\s*\/etc\//i, level: "high", message: "HIGH RISK: overwriting system files via redirection." }
];

export const detectSafety = (text: string): SafetyWarning[] => {
  const warnings: SafetyWarning[] = [];
  for (const rule of safetyRules) {
    if (rule.pattern.test(text)) {
      warnings.push({ level: rule.level, message: rule.message });
    }
  }
  return warnings;
};

export const hasHighRisk = (warnings: SafetyWarning[]): boolean => {
  return warnings.some(warning => warning.level === "high");
};
