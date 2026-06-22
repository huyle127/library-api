import { Schema } from './field-rule';
import { MESSAGES } from '../constants/messages';

const actualType = (v: unknown): string => (Array.isArray(v) ? 'array' : typeof v);

// Engine thuần: nhận data + schema, TRẢ VỀ mảng lỗi (gom hết, không throw).
export const validate = (
  data: Record<string, unknown>,
  schema: Schema,
  options: { partial?: boolean } = {},
): string[] => {
  const { partial = false } = options;
  const errors: string[] = [];

  if (partial && Object.keys(data).length === 0) {
    errors.push(MESSAGES.EMPTY_UPDATE);
  }

  for (const key of Object.keys(schema)) {
    const rule = schema[key];
    const value = data[key];

    if (value === undefined || value === null) {
      if (rule.isRequired && !partial) errors.push(`Missing required field: ${key}`);
      continue; // vắng + (optional | update) -> bỏ qua
    }

    if (rule.type === 'number') {
      if (value === '' || Number.isNaN(Number(value))) {
        errors.push(`Invalid value for field: ${key}. Expected a number.`);
        continue;
      }
    } else if (actualType(value) !== rule.type) {
      errors.push(`Invalid type for field: ${key}. Expected ${rule.type}.`);
      continue;
    }

    if (rule.enumType) {
      const allowed = Object.values(rule.enumType);
      if (!allowed.includes(value as string | number)) {
        errors.push(`Invalid value for field: ${key}. Expected one of: ${allowed.join(', ')}.`);
      }
    }
  }

  return errors;
};
