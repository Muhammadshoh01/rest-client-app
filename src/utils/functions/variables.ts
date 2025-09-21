import { Variable } from '@/types/rest-client';

const VARIABLES_STORAGE_KEY = 'rest_client_variables';

export const saveVariablesToStorage = (variables: Variable[]): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VARIABLES_STORAGE_KEY, JSON.stringify(variables));
    }
  } catch (error) {
    console.error('Failed to save variables to localStorage:', error);
  }
};

export const loadVariablesFromStorage = (): Variable[] => {
  try {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(VARIABLES_STORAGE_KEY);
    if (!stored) return [];

    const variables = JSON.parse(stored);
    return Array.isArray(variables) ? variables : [];
  } catch (error) {
    console.error('Failed to load variables from localStorage:', error);
    return [];
  }
};

export const replaceVariables = (
  text: string,
  variables: Variable[]
): string => {
  let result = text;

  const enabledVariables = variables.filter(
    (v) => v.enabled && v.name && v.value
  );

  enabledVariables.forEach((variable) => {
    const pattern = new RegExp(
      `\\{\\{\\s*${escapeRegExp(variable.name)}\\s*\\}\\}`,
      'g'
    );
    result = result.replace(pattern, variable.value);
  });

  return result;
};

export const findVariablesInText = (text: string): string[] => {
  const variablePattern = /\{\{\s*([^}]+)\s*\}\}/g;
  const matches = text.match(variablePattern) || [];

  return matches
    .map((match) => {
      const name = match.replace(/\{\{\s*|\s*\}\}/g, '');
      return name;
    })
    .filter((name, index, arr) => arr.indexOf(name) === index);
};

export const hasVariables = (text: string): boolean => {
  return /\{\{\s*[^}]+\s*\}\}/.test(text);
};

export const getVariablePreview = (
  text: string,
  variables: Variable[],
  maxLength: number = 100
): { original: string; resolved: string; hasVariables: boolean } => {
  const resolved = replaceVariables(text, variables);
  const hasVars = hasVariables(text);

  const truncateText = (str: string) =>
    str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;

  return {
    original: truncateText(text),
    resolved: truncateText(resolved),
    hasVariables: hasVars,
  };
};

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
