import type { AgentRuntimeConfig } from "../config";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

function messageText(content: ChatMessage["content"]): string {
  if (typeof content === "string") return content;
  return content
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("\n");
}

/** DeepSeek：response_format=json_object 时 prompt 必须含 "json" */
function ensureJsonMention(messages: ChatMessage[]): ChatMessage[] {
  const joined = messages.map((m) => messageText(m.content)).join("\n");
  if (/json/i.test(joined)) return messages;
  return [
    ...messages,
    {
      role: "user",
      content: "Respond with a valid JSON object only.",
    },
  ];
}

export async function chatJson<T>(opts: {
  config: AgentRuntimeConfig;
  messages: ChatMessage[];
  model?: string;
  /** 覆盖 config.llmBaseUrl（如 VL 用 DashScope compatible） */
  baseUrl?: string;
  /** 覆盖 config.llmApiKey */
  apiKey?: string;
  /** 默认 true；部分 VL 模型不支持 json_object */
  jsonObject?: boolean;
  retries?: number;
  parse: (raw: unknown) => T;
}): Promise<T> {
  const { config, messages, parse } = opts;
  const retries = opts.retries ?? 3;
  const model = opts.model || config.llmModel;
  const baseUrl = (opts.baseUrl || config.llmBaseUrl).replace(/\/$/, "");
  const apiKey = opts.apiKey || config.llmApiKey;
  const jsonObject = opts.jsonObject !== false;

  if (config.mock) {
    throw new Error("chatJson 在 mock 模式下应由 Agent 走本地假数据路径");
  }

  const messagesForApi = jsonObject ? ensureJsonMention(messages) : messages;

  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const body: Record<string, unknown> = {
        model,
        messages: messagesForApi,
        temperature: 0.4,
      };
      if (jsonObject) {
        body.response_format = { type: "json_object" };
      }

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`LLM ${res.status}: ${text.slice(0, 400)}`);
      }
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
      };
      const rawContent = data.choices?.[0]?.message?.content;
      const content =
        typeof rawContent === "string"
          ? rawContent
          : Array.isArray(rawContent)
            ? rawContent.map((p) => p.text || "").join("")
            : "";
      if (!content) throw new Error("LLM 返回空内容");
      const json = JSON.parse(extractJson(content)) as unknown;
      return parse(json);
    } catch (err) {
      lastErr = err;
      await sleep(500 * (i + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/** 从模型回复中抽出 JSON（兼容 ```json 围栏） */
function extractJson(content: string): string {
  const trimmed = content.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) return fence[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}
