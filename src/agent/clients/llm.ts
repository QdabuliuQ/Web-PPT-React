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
  retries?: number;
  parse: (raw: unknown) => T;
}): Promise<T> {
  const { config, messages, parse } = opts;
  const retries = opts.retries ?? 3;
  const model = opts.model || config.llmModel;

  if (config.mock) {
    throw new Error("chatJson 在 mock 模式下应由 Agent 走本地假数据路径");
  }

  // DeepSeek 等：使用 json_object 时，messages 里必须出现 "json" 字样
  const messagesForApi = ensureJsonMention(messages);

  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${config.llmBaseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.llmApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messagesForApi,
          temperature: 0.4,
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`LLM ${res.status}: ${text.slice(0, 400)}`);
      }
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("LLM 返回空内容");
      const json = JSON.parse(content) as unknown;
      return parse(json);
    } catch (err) {
      lastErr = err;
      await sleep(500 * (i + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}
