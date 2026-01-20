import { describe, expect, it } from "vitest";
import { formatOutput } from "../src/output";

const makeOutput = (content: string, mode: string) =>
  formatOutput({
    content,
    warnings: [],
    json: true,
    blocked: false,
    mode,
    quiet: false
  });

describe("formatOutput", () => {
  it("extracts commands from fenced blocks", () => {
    const json = makeOutput("```sh\nls -la\n```", "generate");
    const payload = JSON.parse(json);
    expect(payload.items[0].command).toBe("ls -la");
  });

  it("extracts fix sections", () => {
    const content = `# Possible causes\n- Missing file\n\n# Diagnostics\n\
\`\`\`sh\nls -la\n\`\`\`\n\n# Fixes\n\
\`\`\`sh\nmkdir data\n\`\`\``;
    const json = makeOutput(content, "fix");
    const payload = JSON.parse(json);
    expect(payload.fix.causes[0]).toBe("Missing file");
    expect(payload.fix.diagnostics[0].command).toBe("ls -la");
    expect(payload.fix.fixes[0].command).toBe("mkdir data");
  });
});
