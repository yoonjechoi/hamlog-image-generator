// @vitest-environment jsdom

import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBatchForm } from './useBatchForm.js';

describe('useBatchForm', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:preview-url'),
      configurable: true,
      writable: true,
    });

    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(),
      configurable: true,
      writable: true,
    });
  });

  it('has an empty initial state', () => {
    const { result } = renderHook(() => useBatchForm());

    expect(result.current.projectName).toBe('');
    expect(result.current.systemPrompt).toBe('');
    expect(result.current.promptText).toBe('');
    expect(result.current.referenceImage).toBeNull();
    expect(result.current.referenceImagePreview).toBeNull();
  });

  it('updates projectName', () => {
    const { result } = renderHook(() => useBatchForm());

    act(() => {
      result.current.setProjectName('batch-a');
    });

    expect(result.current.projectName).toBe('batch-a');
  });

  it('updates systemPrompt', () => {
    const { result } = renderHook(() => useBatchForm());

    act(() => {
      result.current.setSystemPrompt('act as assistant');
    });

    expect(result.current.systemPrompt).toBe('act as assistant');
  });

  it('updates promptText', () => {
    const { result } = renderHook(() => useBatchForm());

    act(() => {
      result.current.setPromptText('draw skyline');
    });

    expect(result.current.promptText).toBe('draw skyline');
  });

  it('updates referenceImage and creates preview URL', () => {
    const { result } = renderHook(() => useBatchForm());
    const file = new File(['binary'], 'reference.png', { type: 'image/png' });

    act(() => {
      result.current.setReferenceImage(file);
    });

    expect(result.current.referenceImage).toBe(file);
    expect(result.current.referenceImagePreview).toBe('blob:preview-url');
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it('reset clears all form state and revokes preview URL', () => {
    const { result } = renderHook(() => useBatchForm());
    const file = new File(['binary'], 'reference.png', { type: 'image/png' });

    act(() => {
      result.current.setProjectName('project');
      result.current.setSystemPrompt('prompt');
      result.current.setPromptText('text');
      result.current.setReferenceImage(file);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.projectName).toBe('');
    expect(result.current.systemPrompt).toBe('');
    expect(result.current.promptText).toBe('');
    expect(result.current.referenceImage).toBeNull();
    expect(result.current.referenceImagePreview).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-url');
  });

  it('revokes preview URL on unmount cleanup', () => {
    const { result, unmount } = renderHook(() => useBatchForm());
    const file = new File(['binary'], 'reference.png', { type: 'image/png' });

    act(() => {
      result.current.setReferenceImage(file);
    });

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-url');
  });
});
