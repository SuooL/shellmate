import { describe, expect, it } from "vitest";
import { detectAutoMode } from "../src/core/mode";

describe("detectAutoMode", () => {
  it("prefers fix when stdin is used", () => {
    expect(detectAutoMode("some output", true)).toBe("fix");
  });

  it("detects fix for error-like text", () => {
    expect(detectAutoMode("command not found: foo", false)).toBe("fix");
  });

  it("detects explain for command-like input", () => {
    expect(detectAutoMode("tar -xzvf file.tar.gz", false)).toBe("explain");
  });

  it("defaults to generate for natural language", () => {
    expect(detectAutoMode("find recent pdf files", false)).toBe("generate");
  });
});
