import fs from "fs";
import { defaultConfigPath, loadConfig, resolveConfig } from "../config";
import { Config } from "../types";

export type DoctorOptions = {
  configPath?: string;
  providerName?: string;
  model?: string;
  timeoutMs?: number;
};

const formatStatus = (label: string, ok: boolean, detail?: string): string => {
  const status = ok ? "OK" : "FAIL";
  return detail ? `${label}: ${status} (${detail})` : `${label}: ${status}`;
};

const checkConfigFile = (configPath?: string): string => {
  const resolvedPath = configPath ?? defaultConfigPath;
  const exists = fs.existsSync(resolvedPath);
  return formatStatus("Config file", exists, resolvedPath);
};

const checkProvider = (config: Config, providerName?: string): string => {
  const resolvedProvider = providerName ?? config.defaultProvider ?? "openai";
  const providerConfig = config.providers?.[resolvedProvider];
  return formatStatus("Provider", Boolean(providerConfig), resolvedProvider);
};

const checkApiKey = (config: Config, providerName?: string): string => {
  const resolvedProvider = providerName ?? config.defaultProvider ?? "openai";
  const providerConfig = config.providers?.[resolvedProvider];
  const hasKey = Boolean(providerConfig?.apiKey);
  return formatStatus("API key", hasKey, resolvedProvider);
};

const checkModel = (config: Config, providerName?: string, model?: string): string => {
  const resolvedProvider = providerName ?? config.defaultProvider ?? "openai";
  const providerConfig = config.providers?.[resolvedProvider];
  const resolvedModel = model ?? providerConfig?.model ?? config.defaultModel ?? "gpt-4.1";
  return formatStatus("Model", Boolean(resolvedModel), resolvedModel);
};

const checkNetwork = async (config: Config, providerName?: string, timeoutMs?: number): Promise<string> => {
  const resolvedProvider = providerName ?? config.defaultProvider ?? "openai";
  if (resolvedProvider !== "openai") {
    return formatStatus("Network", true, `skipped for ${resolvedProvider}`);
  }

  const providerConfig = config.providers?.[resolvedProvider];
  if (!providerConfig?.apiKey) {
    return formatStatus("Network", false, "missing API key");
  }

  const baseUrl = providerConfig.baseUrl ?? "https://api.openai.com/v1";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs ?? 8000);

  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${providerConfig.apiKey}`
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    return formatStatus("Network", response.ok, response.ok ? baseUrl : `HTTP ${response.status}`);
  } catch (error) {
    clearTimeout(timeout);
    return formatStatus("Network", false, (error as Error).message);
  }
};

export const runConfigDoctor = async (options: DoctorOptions): Promise<string> => {
  const config = resolveConfig(loadConfig(options.configPath));
  const checks = [
    checkConfigFile(options.configPath),
    checkProvider(config, options.providerName),
    checkApiKey(config, options.providerName),
    checkModel(config, options.providerName, options.model),
    await checkNetwork(config, options.providerName, options.timeoutMs)
  ];

  return checks.join("\n");
};
