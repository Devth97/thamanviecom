/**
 * Shared client for NVIDIA's OpenAI-compatible chat API (build.nvidia.com).
 * Handles auth, a hard timeout, and consistent error typing so each AI route
 * (search, recommend, stylist, visual search) stays small.
 *
 * Requires NVIDIA_API_KEY. Text model overridable via NVIDIA_MODEL, vision model
 * via NVIDIA_VISION_MODEL.
 */
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export const TEXT_MODEL = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-8b-instruct";
export const VISION_MODEL = process.env.NVIDIA_VISION_MODEL ?? "meta/llama-3.2-11b-vision-instruct";

export class AiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

/** OpenAI-style message; content may be a string or multimodal parts (for vision). */
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | Array<Record<string, unknown>>;
};

interface CallOpts {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

/** Call NVIDIA chat completions and return the assistant text. Throws AiError. */
export async function callNvidia(messages: ChatMessage[], opts: CallOpts = {}): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new AiError("AI isn't configured yet. Add NVIDIA_API_KEY to enable it.", 503);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 20_000);

  try {
    const res = await fetch(NVIDIA_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model ?? TEXT_MODEL,
        messages,
        temperature: opts.temperature ?? 0.2,
        max_tokens: opts.maxTokens ?? 512,
      }),
    });

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      console.error("NVIDIA error:", res.status, detail);
      throw new AiError("AI is temporarily unavailable.", 502);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new AiError("AI took too long. Please try again.", 504);
    }
    if (err instanceof AiError) throw err;
    throw new AiError((err as Error).message, 500);
  } finally {
    clearTimeout(timeout);
  }
}

/** Extract the first JSON object from a model reply, tolerating fences/reasoning. */
export function parseJsonReply<T = Record<string, unknown>>(text: string): T | null {
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/```(?:json)?/gi, "");
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}
