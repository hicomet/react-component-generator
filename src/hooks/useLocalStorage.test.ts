import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 값이 없으면 초기값을 반환한다', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('저장된 값이 있으면 초기값 대신 그 값을 반환한다', () => {
    localStorage.setItem('k', JSON.stringify('saved'));
    const { result } = renderHook(() => useLocalStorage('k', 'init'));
    expect(result.current[0]).toBe('saved');
  });

  it('값을 바꾸면 localStorage에 JSON으로 저장한다', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'init'));
    act(() => result.current[1]('next'));
    expect(localStorage.getItem('k')).toBe(JSON.stringify('next'));
  });

  it('함수형 업데이트를 지원한다', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('k', []));
    act(() => result.current[1]((prev) => [...prev, 'a']));
    act(() => result.current[1]((prev) => [...prev, 'b']));
    expect(result.current[0]).toEqual(['a', 'b']);
  });

  it('저장된 JSON이 깨져 있으면 초기값을 반환한다', () => {
    localStorage.setItem('k', '{broken');
    const { result } = renderHook(() => useLocalStorage('k', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('parse가 null을 반환하면 초기값을 반환한다', () => {
    localStorage.setItem('k', JSON.stringify(123));
    const { result } = renderHook(() =>
      useLocalStorage('k', 'init', (raw) => (typeof raw === 'string' ? raw : null)),
    );
    expect(result.current[0]).toBe('init');
  });

  it('parse로 저장된 값을 복원 변환할 수 있다', () => {
    localStorage.setItem('k', JSON.stringify({ at: '2026-01-01T00:00:00.000Z' }));
    const { result } = renderHook(() =>
      useLocalStorage('k', { at: new Date(0) }, (raw) => {
        const r = raw as { at: string };
        return { at: new Date(r.at) };
      }),
    );
    expect(result.current[0].at).toBeInstanceOf(Date);
    expect(result.current[0].at.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });
});
