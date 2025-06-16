import { SelectOption } from '@/components/custom/basic-select';
import { z } from 'zod';

// Login form validation schema
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z]).+$/,
      'Password must contain at least one number, lowercase letter, uppercase letter, and special character',
    ),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Field types for dropdown
export const fieldTypes: SelectOption[] = [
  { id: 'string', value: 'string', label: 'String' },
  { id: 'number', value: 'number', label: 'Number' },
  { id: 'float', value: 'float', label: 'Float' }, // Float is treated as number
  { id: 'boolean', value: 'boolean', label: 'Boolean' },
  { id: 'array', value: 'array', label: 'Array' },
  { id: 'datetime', value: 'datetime', label: 'DateTime' },
  { id: 'relation', value: 'relation', label: 'Relation' },
  { id: 'enum', value: 'enum', label: 'Enum' },
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
    type: z.enum(['string', 'number', 'float', 'boolean', 'array', 'datetime', 'relation', 'enum'], {
      required_error: 'Field type is required',
    }),
    required: z.boolean().default(false),
    isArray: z.boolean().default(false),
    description: z.string().optional(),
    defaultValue: z.string().optional(),
    relationCollection: z.string().optional(),
    enumValues: z.array(z.string()).optional(),
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
  )
  .refine(
    (data) => {
      // If type is enum, enumValues must be provided and not empty
      if (data.type === 'enum') {
        return !!data.enumValues && data.enumValues.length > 0;
      }
      return true;
    },
    {
      message: 'Enum values are required when field type is enum',
      path: ['enumValues'], // Path to the field that has the error
    },
  );

// Collection Request schema (for create and update operations)
export const cuCollectionReqSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, 'Collection name is required')
    .regex(
      /^[a-zA-Z]\w*$/,
      'Collection name must start with a letter and contain only letters, numbers and underscores',
    ),
  fields: z.array(collectionFieldSchema).min(1, 'Collection must have at least one field'),
});

// Infer types from schemas
export type CollectionFieldType = z.infer<typeof collectionFieldSchema>;
export type CUCollectionFieldValues = z.infer<typeof cuCollectionReqSchema>;

// ============= MEME RELATION SCHEMAS =============

// Schema for meme objects
export const memeObjectSchema = z.object({
  id: z.string().optional(),
  label_en: z.string().min(1, { message: "English label is required" }),
  label_vi: z.string().min(1, { message: "Vietnamese label is required" }),
  slug: z.string().min(1, { message: "Slug is required" })
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug may contain lowercase letters, numbers and hyphens'),
  // System-managed fields (not editable in forms):
  // usageCount, lastUsedAt, trendingScore
});

export type MemeObjectFormValues = z.infer<typeof memeObjectSchema>;

// Schema for meme tags
export const memeTagSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, { message: "Label is required" }),
  // System-managed fields (not editable in forms):
  // usageCount, lastUsedAt, trendingScore
});

export type MemeTagFormValues = z.infer<typeof memeTagSchema>;

// Schema for meme moods
export const memeMoodSchema = z.object({
  id: z.string().optional(),
  label_en: z.string().min(1, { message: "English label is required" }),
  label_vi: z.string().min(1, { message: "Vietnamese label is required" }),
  slug: z.string().min(1, { message: "Slug is required" })
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug may contain lowercase letters, numbers and hyphens'),
  // intensity: z.number().int().min(1).max(10).optional(),
  // System-managed fields (not editable in forms):
  // usageCount, lastUsedAt, trendingScore
});

export type MemeMoodFormValues = z.infer<typeof memeMoodSchema>;
