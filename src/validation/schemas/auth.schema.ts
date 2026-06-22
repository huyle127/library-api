import { Schema } from '../field-rule';

export const registerSchema: Schema = {
  username: { type: 'string', isRequired: true },
  password: { type: 'string', isRequired: true },
};

export const loginSchema: Schema = {
  username: { type: 'string', isRequired: true },
  password: { type: 'string', isRequired: true },
};
