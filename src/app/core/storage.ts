import { effect, signal, WritableSignal } from '@angular/core';

interface Envelope<T> {
  v: number;
  d: T;
}

/**
 * A signal whose value is mirrored into localStorage, so a reload keeps the
 * cart / wishlist / addresses the user built up.
 *
 * Values are stored inside a versioned envelope: bump `version` whenever the
 * stored shape changes and stale payloads are discarded instead of being read
 * back into a shape the app no longer understands. Falls back to plain state
 * when storage is unavailable (private windows, blocked site data).
 */
export function persistentSignal<T>(key: string, initial: T, version = 1): WritableSignal<T> {
  const state = signal<T>(read(key, initial, version));

  effect(() => {
    const envelope: Envelope<T> = { v: version, d: state() };
    try {
      localStorage.setItem(key, JSON.stringify(envelope));
    } catch {
      // storage unavailable — keep working in memory only
    }
  });

  return state;
}

function read<T>(key: string, fallback: T, version: number): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed: unknown = JSON.parse(raw);
    const isEnvelope =
      !!parsed && typeof parsed === 'object' && 'v' in parsed && 'd' in parsed;

    // Anything unversioned predates the envelope, so treat it as stale.
    if (!isEnvelope) return fallback;

    const envelope = parsed as Envelope<T>;
    return envelope.v === version ? envelope.d : fallback;
  } catch {
    return fallback;
  }
}
