export type ImageProvider = "openai" | "custom";

/** skeleton：meta + 骨架 compile；html：Layout HTML + Puppeteer 测坐标 */
export type AgentPipelineMode = "skeleton" | "html";

export type AgentRuntimeConfig = {
  llmBaseUrl: string;
  llmApiKey: string;
  llmModel: string;
  llmModelLight?: string;
  /** 页面打分 VL（默认 DashScope OpenAI 兼容） */
  vlBaseUrl: string;
  vlApiKey: string;
  vlModel: string;
  imageProvider: ImageProvider;
  /** 自定义生图：完整 POST URL；openai：host，自动拼 /images/generations */
  imageBaseUrl: string;
  imageApiKey: string;
  imageModel: string;
  /** 自定义生图尺寸，如 1024x1024 / 16:9 */
  imageAspectRatio: string;
  imageConcurrency: number;
  mock: boolean;
  /** 生成管线：默认 skeleton；AGENT_PIPELINE=html 或 --html 切换 */
  pipelineMode: AgentPipelineMode;
  maxGateIterations: number;
  /** VisualGate 是否用 Puppeteer DOM 测高（默认 true；AGENT_GATE_DOM=0 关闭） */
  useDomMeasure: boolean;
  /** 截图 + VL 打分（默认 true；AGENT_PAGE_SCORE=0 关闭） */
  usePageScore: boolean;
  /** ≥ 该分不回炉，默认 9 */
  scorePassThreshold: number;
  maxScoreIterations: number;
};

export function loadAgentConfig(
  overrides: Partial<AgentRuntimeConfig> = {}
): AgentRuntimeConfig {
  const mock =
    overrides.mock ??
    (process.env.AGENT_MOCK === "1" ||
      (!process.env.LLM_API_KEY &&
        !process.env.DASHSCOPE_API_KEY &&
        !overrides.llmApiKey &&
        !overrides.vlApiKey));

  const imageProvider = (overrides.imageProvider ||
    process.env.IMAGE_API_PROVIDER ||
    "custom") as ImageProvider;

  const llmApiKey = overrides.llmApiKey || process.env.LLM_API_KEY || "";
  const vlApiKey =
    overrides.vlApiKey ||
    process.env.SCORE_VL_API_KEY ||
    process.env.DASHSCOPE_API_KEY ||
    llmApiKey;

  return {
    llmBaseUrl:
      overrides.llmBaseUrl ||
      process.env.LLM_BASE_URL ||
      "https://api.deepseek.com",
    llmApiKey,
    llmModel: overrides.llmModel || process.env.LLM_MODEL || "deepseek-chat",
    llmModelLight:
      overrides.llmModelLight || process.env.LLM_MODEL_LIGHT || undefined,
    vlBaseUrl:
      overrides.vlBaseUrl ||
      process.env.SCORE_VL_BASE_URL ||
      process.env.DASHSCOPE_BASE_URL ||
      "https://dashscope.aliyuncs.com/compatible-mode/v1",
    vlApiKey,
    vlModel:
      overrides.vlModel || process.env.SCORE_VL_MODEL || "qwen-vl-max",
    imageProvider,
    imageBaseUrl:
      overrides.imageBaseUrl || process.env.IMAGE_API_BASE_URL || "",
    imageApiKey: overrides.imageApiKey || process.env.IMAGE_API_KEY || "",
    imageModel:
      overrides.imageModel || process.env.IMAGE_MODEL || "gpt-image-2",
    imageAspectRatio:
      overrides.imageAspectRatio ||
      process.env.IMAGE_ASPECT_RATIO ||
      "1024x1024",
    imageConcurrency: overrides.imageConcurrency ?? 2,
    mock,
    pipelineMode: (() => {
      if (overrides.pipelineMode === "html" || overrides.pipelineMode === "skeleton") {
        return overrides.pipelineMode;
      }
      const env = (process.env.AGENT_PIPELINE || "").trim().toLowerCase();
      if (env === "html" || env === "html-slide" || env === "slide-html") {
        return "html";
      }
      return "skeleton";
    })(),
    maxGateIterations: overrides.maxGateIterations ?? 3,
    useDomMeasure:
      overrides.useDomMeasure ??
      !(
        process.env.AGENT_GATE_DOM === "0" ||
        process.env.AGENT_GATE_DOM === "false"
      ),
    usePageScore:
      overrides.usePageScore ??
      !(
        process.env.AGENT_PAGE_SCORE === "0" ||
        process.env.AGENT_PAGE_SCORE === "false"
      ),
    scorePassThreshold: overrides.scorePassThreshold ?? 9,
    maxScoreIterations: overrides.maxScoreIterations ?? 2,
  };
}
