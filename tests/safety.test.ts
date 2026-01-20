import { describe, expect, it } from "vitest";
import { detectSafety, hasHighRisk } from "../src/core/safety";

describe("detectSafety", () => {
  it("detects high-risk patterns", () => {
    const warnings = detectSafety("rm -rf ./tmp");
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]?.level).toBe("high");
  });

  it("detects redirection risk", () => {
    const warnings = detectSafety("echo hi > /etc/passwd");
    expect(warnings.some(warning => warning.level === "high")).toBe(true);
  });

  it("detects chmod 777 as high risk", () => {
    const warnings = detectSafety("chmod -R 777 /tmp/data");
    expect(warnings.some(warning => warning.level === "high")).toBe(true);
  });

  it("reports if any warning is high", () => {
    const warnings = detectSafety("dd if=/dev/zero of=/dev/sda");
    expect(hasHighRisk(warnings)).toBe(true);
  });
});
