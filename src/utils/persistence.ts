import type { GeneratedComponent, Provider } from '../types';

export const HISTORY_LIMIT = 20;

const PROVIDERS: readonly Provider[] = ['anthropic', 'google'];

export function addToHistory(history: string[], prompt: string): string[] {
  return [prompt, ...history.filter((p) => p !== prompt)].slice(0, HISTORY_LIMIT);
}

export function parseHistory(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.filter((p): p is string => typeof p === 'string');
}

export function parseProvider(raw: unknown): Provider | null {
  return PROVIDERS.find((p) => p === raw) ?? null;
}

export function parseComponents(raw: unknown): GeneratedComponent[] | null {
  if (!Array.isArray(raw)) return null;
  const result: GeneratedComponent[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;
    const { id, prompt, code, createdAt } = item as Record<string, unknown>;
    if (typeof id !== 'string' || typeof prompt !== 'string' || typeof code !== 'string') continue;
    if (typeof createdAt !== 'string') continue;
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) continue;
    result.push({ id, prompt, code, createdAt: date });
  }
  return result;
}
