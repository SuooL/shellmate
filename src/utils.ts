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

export const copyToClipboard = async (text: string): Promise<void> => {
  const clipboardy = await import("clipboardy");
  await clipboardy.write(text);
};
