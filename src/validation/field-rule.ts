export type FieldType = 'string' | 'number' | 'boolean' | 'array';

export interface FieldRule {
  type: FieldType;
  isRequired?: boolean;
  enumType?: Record<string, string | number>;
}

export type Schema = Record<string, FieldRule>;
