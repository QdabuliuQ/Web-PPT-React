export type ImageProvider = "openai" | "custom";

export type AgentRuntimeConfig = {
  llmBaseUrl: string;
  llmApiKey: string;
  llmModel: string;
  llmModelLight?: string;
  imageProvider: ImageProvider;
  /** 自定义生图：完整 POST URL；openai：host，自动拼 /images/generations */
  imageBaseUrl: string;
  imageApiKey: string;
  imageModel: string;
  /** 自定义生图尺寸，如 1024x1024 / 16:9 */
  imageAspectRatio: string;
  imageConcurrency: number;
  mock: boolean;
  maxGateIterations: number;
};

export function loadAgentConfig(
  overrides: Partial<AgentRuntimeConfig> = {}
): AgentRuntimeConfig {
  const mock =
    overrides.mock ??
    (process.env.AGENT_MOCK === "1" ||
      (!process.env.LLM_API_KEY && !overrides.llmApiKey));

  const imageProvider = (overrides.imageProvider ||
    process.env.IMAGE_API_PROVIDER ||
    "custom") as ImageProvider;

  return {
    llmBaseUrl:
      overrides.llmBaseUrl ||
      process.env.LLM_BASE_URL ||
      "https://api.deepseek.com",
    llmApiKey: overrides.llmApiKey || process.env.LLM_API_KEY || "",
    llmModel: overrides.llmModel || process.env.LLM_MODEL || "deepseek-chat",
    llmModelLight:
      overrides.llmModelLight || process.env.LLM_MODEL_LIGHT || undefined,
    imageProvider,
    imageBaseUrl:
      overrides.imageBaseUrl ||
      process.env.IMAGE_API_BASE_URL ||
      "",
    imageApiKey: overrides.imageApiKey || process.env.IMAGE_API_KEY || "",
    imageModel:
      overrides.imageModel || process.env.IMAGE_MODEL || "gpt-image-2",
    imageAspectRatio:
      overrides.imageAspectRatio ||
      process.env.IMAGE_ASPECT_RATIO ||
      "1024x1024",
    imageConcurrency: overrides.imageConcurrency ?? 2,
    mock,
    maxGateIterations: overrides.maxGateIterations ?? 3,
  };
}
