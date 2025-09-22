import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  saveVariablesToStorage,
  loadVariablesFromStorage,
  replaceVariables,
  findVariablesInText,
  hasVariables,
  getVariablePreview,
} from '../../utils/functions/variables';
import type { Variable } from '@/types/rest-client';

const VARIABLES_STORAGE_KEY = 'rest_client_variables';

const mockVariables: Variable[] = [
  { id: '1', name: 'name', value: 'Alice', enabled: true },
  { id: '2', name: 'city', value: 'Paris', enabled: false },
  { id: '3', name: 'greeting', value: 'Hello', enabled: true },
];

beforeEach(() => {
  const store: Record<string, string> = {};
  Object.assign(window, {
    localStorage: {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, val: string) => {
        store[key] = val;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach((k) => delete store[k]);
      }),
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('saveVariablesToStorage', () => {
  it('saves variables to localStorage', () => {
    saveVariablesToStorage(mockVariables);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      VARIABLES_STORAGE_KEY,
      JSON.stringify(mockVariables)
    );
  });

  it('handles localStorage errors gracefully', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementationOnce(() => {
        throw new Error('fail');
      });

    expect(() => saveVariablesToStorage(mockVariables)).not.toThrow();

    setItemSpy.mockRestore();
  });
});

describe('loadVariablesFromStorage', () => {
  it('returns [] when nothing in storage', () => {
    expect(loadVariablesFromStorage()).toEqual([]);
  });

  it('returns parsed array when valid JSON exists', () => {
    localStorage.setItem(VARIABLES_STORAGE_KEY, JSON.stringify(mockVariables));
    const result = loadVariablesFromStorage();
    expect(result.length).toBe(3);
    expect(result[0].name).toBe('name');
  });

  it('returns [] when parsed value is not an array', () => {
    localStorage.setItem(VARIABLES_STORAGE_KEY, JSON.stringify({ foo: 'bar' }));
    expect(loadVariablesFromStorage()).toEqual([]);
  });

  it('handles JSON.parse errors gracefully', () => {
    localStorage.getItem = vi.fn().mockReturnValue('INVALID JSON');
    expect(loadVariablesFromStorage()).toEqual([]);
  });
});

describe('replaceVariables', () => {
  it('replaces enabled variables', () => {
    const text = 'Hi {{ name }}, welcome to {{ city }}!';
    const replaced = replaceVariables(text, mockVariables);
    expect(replaced).toBe('Hi Alice, welcome to {{ city }}!');
  });

  it('ignores disabled or missing variables', () => {
    const text = 'Say {{ greeting }} to {{ city }}';
    const replaced = replaceVariables(text, mockVariables);
    expect(replaced).toBe('Say Hello to {{ city }}');
  });

  it('handles text without variables', () => {
    expect(replaceVariables('No variables here', mockVariables)).toBe(
      'No variables here'
    );
  });
});

describe('findVariablesInText', () => {
  it('finds all unique variable names', () => {
    const text = 'Hi {{ name }} and {{ name }}, from {{ city }}';
    const vars = findVariablesInText(text);
    expect(vars).toEqual(['name', 'city']);
  });

  it('returns [] when no variables', () => {
    expect(findVariablesInText('plain text')).toEqual([]);
  });
});

describe('hasVariables', () => {
  it('detects variables', () => {
    expect(hasVariables('{{ name }}')).toBe(true);
    expect(hasVariables('no vars')).toBe(false);
  });
});

describe('getVariablePreview', () => {
  it('returns truncated preview with replaced variables', () => {
    const text = 'Hello {{ name }}!';
    const preview = getVariablePreview(text, mockVariables, 50);
    expect(preview.original).toBe('Hello {{ name }}!');
    expect(preview.resolved).toBe('Hello Alice!');
    expect(preview.hasVariables).toBe(true);
  });

  it('truncates long text', () => {
    const longText = 'x'.repeat(120);
    const preview = getVariablePreview(longText, [], 30);
    expect(preview.original.endsWith('...')).toBe(true);
    expect(preview.resolved.endsWith('...')).toBe(true);
  });
});
