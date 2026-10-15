import { describe, expect, it } from 'vitest';
import {
  addToHistory,
  HISTORY_LIMIT,
  parseComponents,
  parseHistory,
  parseProvider,
} from './persistence';

describe('addToHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addToHistory(['a'], 'b')).toEqual(['b', 'a']);
  });

  it('이미 있는 프롬프트는 중복 없이 맨 앞으로 올린다', () => {
    expect(addToHistory(['a', 'b', 'c'], 'c')).toEqual(['c', 'a', 'b']);
  });

  it(`최대 ${HISTORY_LIMIT}개까지만 유지한다`, () => {
    const full = Array.from({ length: HISTORY_LIMIT }, (_, i) => `p${i}`);
    const next = addToHistory(full, 'new');
    expect(next).toHaveLength(HISTORY_LIMIT);
    expect(next[0]).toBe('new');
    expect(next).not.toContain(`p${HISTORY_LIMIT - 1}`);
  });
});

describe('parseHistory', () => {
  it('문자열 배열이면 그대로 반환한다', () => {
    expect(parseHistory(['a', 'b'])).toEqual(['a', 'b']);
  });

  it('배열이 아니면 null', () => {
    expect(parseHistory('x')).toBeNull();
  });

  it('문자열이 아닌 항목은 걸러낸다', () => {
    expect(parseHistory(['a', 1, null])).toEqual(['a']);
  });
});

describe('parseProvider', () => {
  it('유효한 provider는 그대로 반환한다', () => {
    expect(parseProvider('anthropic')).toBe('anthropic');
    expect(parseProvider('google')).toBe('google');
  });

  it('알 수 없는 값은 null', () => {
    expect(parseProvider('openai')).toBeNull();
    expect(parseProvider(1)).toBeNull();
  });
});

describe('parseComponents', () => {
  const valid = {
    id: '1',
    prompt: 'p',
    code: 'c',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('createdAt을 Date로 복원한다', () => {
    const [c] = parseComponents([valid])!;
    expect(c.createdAt).toBeInstanceOf(Date);
    expect(c.createdAt.toISOString()).toBe(valid.createdAt);
  });

  it('배열이 아니면 null', () => {
    expect(parseComponents({})).toBeNull();
  });

  it('필드가 잘못된 항목은 걸러낸다', () => {
    const result = parseComponents([valid, { id: 2 }, { ...valid, createdAt: 'nope' }]);
    expect(result).toHaveLength(1);
  });
});
