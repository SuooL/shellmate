import fs from "fs";
import os from "os";
import path from "path";
import { z } from "zod";
import { Config } from "./types";

const providerSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  timeoutMs: z.number().optional(),
  retries: z.number().optional()
});

const configSchema = z.object({
  defaultProvider: z.string().optional(),
  defaultModel: z.string().optional(),
  defaults: z
    .object({
      temperature: z.number().optional(),
      maxTokens: z.number().optional(),
      timeoutMs: z.number().optional(),
      retries: z.number().optional()
    })
    .optional(),
  providers: z.record(providerSchema).optional(),
  safety: z
    .object({
      warnOnDangerousCommands: z.boolean().optional(),
      blockOnVeryDangerous: z.boolean().optional()
    })
    .optional()
});

export const defaultConfigPath = path.join(os.homedir(), ".shellmate", "config.json");

export const loadConfig = (configPath?: string): Config => {
  const resolvedPath = configPath ?? defaultConfigPath;
  if (!fs.existsSync(resolvedPath)) {
    return {};
  }

  const raw = fs.readFileSync(resolvedPath, "utf8");
  const parsed = JSON.parse(raw) as Config;
  const result = configSchema.safeParse(parsed);
  if (!result.success) {
    const message = result.error.issues.map(issue => issue.message).join(", ");
    throw new Error(`Invalid config file: ${message}`);
  }
  return result.data;
};

export const resolveEnvValue = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  if (!value.startsWith("ENV:")) {
    return value;
  }
  const envKey = value.slice("ENV:".length);
  return process.env[envKey];
};

export const resolveConfig = (config: Config): Config => {
  if (!config.providers) {
    return config;
  }
  const resolvedProviders = Object.fromEntries(
    Object.entries(config.providers).map(([name, provider]) => [
      name,
      {
        ...provider,
        apiKey: resolveEnvValue(provider.apiKey)
      }
    ])
  );
  return {
    ...config,
    providers: resolvedProviders
  };
};
