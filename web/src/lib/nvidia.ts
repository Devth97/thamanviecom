/**
 * Shared client for NVIDIA's OpenAI-compatible chat API (build.nvidia.com).
 * Handles auth, a hard timeout, and consistent error typing so each AI route
 * (search, recommend, stylist, visual search) stays small.
 *
 * MODEL LIFECYCLE: NVIDIA retires hosted models without notice — on 2026-08-26
 * `meta/llama-3.1-8b-instruct` hit end-of-life and returned HTTP 410, silently
 * breaking AI Search, recommendations and the stylist. To stop that recurring we
 * try a CHAIN of models: if one is gone (404/410) or unavailable (5xx) we fall
 * through to the next automatically. Set NVIDIA_MODEL / NVIDIA_VISION_MODEL to
 * force a specific model to the front of the chain.
 */
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

/** Prepend an env override (if set) to a default chain, without duplicates. */
const chain = (override: string | undefined, defaults: string[]): string[] =>
  override ? [override, ...defaults.filter((m) => m !== override)] : defaults;

/** Text models, best-first. All verified callable on the current account. */
export const TEXT_MODELS = chain(process.env.NVIDIA_MODEL, [
  "openai/gpt-oss-20b",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
  "meta/muse-glimmer-30b",
]);

/** Multimodal models that accept image_url content, best-first. */
export const VISION_MODELS = chain(process.env.NVIDIA_VISION_MODEL, [
  "meta/llama-3.2-11b-vision-instruct",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
]);

/** Kept for backwards compatibility with existing imports. */
export const TEXT_MODEL = TEXT_MODELS[0];
export const VISION_MODEL = VISION_MODELS[0];

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
  /** Force a single model. */
  model?: string;
  /** Or supply an explicit fallback chain (defaults to TEXT_MODELS). */
  models?: string[];
  temperature?: number;
  maxTokens?: number;
  /** Timeout per model attempt. */
  timeoutMs?: number;
}

/**
 * Minimum token budget. Reasoning models emit hidden reasoning first, so a
 * 256-token cap left `content` empty and silently broke the stylist.
 */
const REASONING_TOKEN_FLOOR = 1500;

/** A model that's retired/missing/overloaded — worth falling through to the next. */
const shouldTryNextModel = (status: number) =>
  status === 404 || status === 410 || status === 429 || status >= 500;

async function callOnce(
  model: string,
  apiKey: string,
  messages: ChatMessage[],
  opts: CallOpts
): Promise<string> {
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
        model,
        messages,
        temperature: opts.temperature ?? 0.2,
        // Reasoning models (gpt-oss, nemotron) spend max_tokens on hidden
        // reasoning BEFORE emitting content — with a small budget they return
        // an empty answer. Keep a floor so the actual reply always fits.
        max_tokens: Math.max(opts.maxTokens ?? 512, REASONING_TOKEN_FLOOR),
        // Verified safe on every model in our chains; keeps reasoning short so
        // responses stay fast.
        reasoning_effort: "low",
      }),
    });

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      console.error(`NVIDIA error [${model}]:`, res.status, detail);
      const err = new AiError("AI is temporarily unavailable.", 502);
      // Tag so the caller knows whether falling through is worthwhile.
      (err as AiError & { retryable?: boolean }).retryable = shouldTryNextModel(res.status);
      throw err;
    }

    const data = await res.json();
    const msg = data.choices?.[0]?.message ?? {};
    // Reasoning models sometimes leave `content` null and put everything in
    // `reasoning`; use that rather than returning nothing.
    return (msg.content || msg.reasoning || "") as string;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Call NVIDIA chat completions and return the assistant text, walking the model
 * chain when a model is retired or unavailable. Throws AiError.
 */
export async function callNvidia(messages: ChatMessage[], opts: CallOpts = {}): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new AiError("AI isn't configured yet. Add NVIDIA_API_KEY to enable it.", 503);
  }

  const models = opts.models ?? (opts.model ? [opts.model] : TEXT_MODELS);
  let lastError: AiError | null = null;

  for (const model of models) {
    try {
      return await callOnce(model, apiKey, messages, opts);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        lastError = new AiError("AI took too long. Please try again.", 504);
        continue; // a stuck model shouldn't doom the whole request
      }
      if (err instanceof AiError) {
        lastError = err;
        if ((err as AiError & { retryable?: boolean }).retryable) continue;
        throw err;
      }
      lastError = new AiError((err as Error).message, 500);
    }
  }

  throw lastError ?? new AiError("AI is temporarily unavailable.", 502);
}

/**
 * Extract a JSON object from a model reply, tolerating code fences, <think>
 * blocks and trailing prose. Tries the widest match first, then progressively
 * narrower candidates, so a stray brace in prose can't break parsing.
 */
export function parseJsonReply<T = Record<string, unknown>>(text: string): T | null {
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/```(?:json)?/gi, "");

  const greedy = cleaned.match(/\{[\s\S]*\}/);
  if (greedy) {
    try {
      return JSON.parse(greedy[0]) as T;
    } catch {
      /* fall through to narrower candidates */
    }
  }
  // Narrower: each individual {...} block, last one first (models often restate).
  const blocks = cleaned.match(/\{[^{}]*\}/g);
  if (blocks) {
    for (const b of [...blocks].reverse()) {
      try {
        return JSON.parse(b) as T;
      } catch {
        /* try the next block */
      }
    }
  }
  return null;
}
