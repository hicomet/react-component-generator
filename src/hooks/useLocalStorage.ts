import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

function read<T>(key: string, initial: T, parse?: (raw: unknown) => T | null): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return initial;
    const raw: unknown = JSON.parse(stored);
    if (!parse) return raw as T;
    const parsed = parse(raw);
    return parsed === null ? initial : parsed;
  } catch {
    return initial;
  }
}

export function useLocalStorage<T>(
  key: string,
  initial: T,
  parse?: (raw: unknown) => T | null,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => read(key, initial, parse));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장소 사용 불가(용량 초과, 차단)여도 메모리 상태로 계속 동작한다
    }
  }, [key, value]);

  return [value, setValue];
}
