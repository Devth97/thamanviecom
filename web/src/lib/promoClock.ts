/**
 * Shared promo countdown clock.
 *
 * A single evergreen deadline is persisted in localStorage and shared by every
 * card on the page. Exactly ONE setInterval runs regardless of how many
 * countdowns are mounted (avoids N timers for N product cards). When the
 * deadline passes it silently rolls forward by the configured duration, so the
 * "limited offer" always shows time remaining.
 */

const STORAGE_KEY = "tmv_promo_deadline";

type Listener = (remainingMs: number) => void;

const listeners = new Set<Listener>();
let deadline = 0;
let durationMs = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;

/** Read or (re)establish the shared deadline in localStorage. */
function ensureDeadline(): void {
  const now = Date.now();
  let stored = 0;
  try {
    stored = Number(localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    stored = 0; // private mode / storage disabled — fall back to in-memory
  }

  if (!stored || stored <= now) {
    deadline = now + durationMs;
    try {
      localStorage.setItem(STORAGE_KEY, String(deadline));
    } catch {
      /* ignore persistence failure */
    }
  } else {
    deadline = stored;
  }
}

function emit(): void {
  let remaining = deadline - Date.now();
  if (remaining <= 0) {
    ensureDeadline(); // roll the evergreen window forward
    remaining = deadline - Date.now();
  }
  for (const listener of listeners) listener(Math.max(0, remaining));
}

/**
 * Subscribe to the shared countdown. Returns an unsubscribe function.
 * The first subscriber sets the duration and starts the single interval.
 */
export function subscribePromoClock(
  listener: Listener,
  durationHours: number
): () => void {
  if (durationMs === 0) durationMs = Math.max(1, durationHours) * 3600_000;

  if (listeners.size === 0) {
    ensureDeadline();
    intervalId = setInterval(emit, 1000);
  }

  listeners.add(listener);
  listener(Math.max(0, deadline - Date.now())); // fire immediately, no 1s blank

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

/** Split a remaining-ms value into padded h/m/s parts. */
export function formatRemaining(remainingMs: number): {
  hours: string;
  minutes: string;
  seconds: string;
} {
  const total = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
}
