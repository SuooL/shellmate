export type ProviderErrorCode = "auth" | "rate_limit" | "network" | "invalid_response" | "unknown";

export class ProviderError extends Error {
  code: ProviderErrorCode;

  constructor(code: ProviderErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
