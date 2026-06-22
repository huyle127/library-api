import { Schema } from '../field-rule';
import { Role } from '../../enums/role';

export const createCategorySchema: Schema = {
  name: { type: 'string', isRequired: true },
};

export const updateCategorySchema: Schema = {
  name: { type: 'string', isRequired: true },
};