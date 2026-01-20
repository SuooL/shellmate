import { describe, expect, it } from "vitest";
import { buildPrompt } from "../src/prompts";

const corePhrase = "You are Shellmate";

describe("buildPrompt", () => {
  it("includes core and mode prompts", () => {
    const prompt = buildPrompt("generate", "list files");
    expect(prompt.system).toContain(corePhrase);
    expect(prompt.system).toContain("Convert a user's natural language intent");
  });

  it("adds detail prompt for explain when requested", () => {
    const prompt = buildPrompt("explain", "ls -la", { detail: true });
    expect(prompt.system).toContain("Gotchas");
  });
});
