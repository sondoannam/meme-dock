import { SelectOption } from '@/components/custom/basic-select';
import { z } from 'zod';

// Field types for dropdown
export const fieldTypes: SelectOption[] = [
  { id: 'string', value: 'string', label: 'String' },
  { id: 'number', value: 'number', label: 'Number' },
  { id: 'boolean', value: 'boolean', label: 'Boolean' },
  { id: 'array', value: 'array', label: 'Array' },
  { id: 'datetime', value: 'datetime', label: 'DateTime' },
  { id: 'relation', value: 'relation', label: 'Relation' },
];

export type FieldType = (typeof fieldTypes)[number]['value'];

// Collection field validation schema
export const collectionFieldSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Field name is required')
      .regex(
        /^[a-zA-Z]\w*$/,
        'Field name must start with a letter and contain only letters, numbers and underscores',
      ),
    type: z.enum(['string', 'number', 'boolean', 'array', 'datetime', 'relation'], {
      required_error: 'Field type is required',
    }),
    required: z.boolean().default(false),
    isArray: z.boolean().default(false),
    description: z.string().optional(),
    defaultValue: z.string().optional(),
    relationCollection: z.string().optional(),
  })
  .refine(
    (data) => {
      // If type is relation, relationCollection must be provided
      if (data.type === 'relation') {
        return !!data.relationCollection;
      }
      return true;
    },
    {
      message: 'Relation collection is required when field type is relation',
      path: ['relationCollection'], // Path to the field that has the error
    },
  );

// Collection schema validation
export const collectionSchema = z.object({
  name: z
    .string()
    .min(1, 'Collection name is required')
    .regex(
      /^[a-zA-Z]\w*$/,
      'Collection name must start with a letter and contain only letters, numbers and underscores',
    ),
  slug: z
    .string()
    .min(1, 'Collection slug is required')
    .regex(
      /^[a-z][a-z0-9_-]*$/,
      'Slug must start with a lowercase letter and contain only lowercase letters, numbers, dashes and underscores',
    ),
  description: z.string().optional(),
  fields: z.array(collectionFieldSchema).min(1, 'Collection must have at least one field'),
});

// Infer types from schemas
export type CollectionFieldType = z.infer<typeof collectionFieldSchema>;
export type CollectionSchemaType = z.infer<typeof collectionSchema>;
