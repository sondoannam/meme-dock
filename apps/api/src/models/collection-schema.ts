// Define the types for collection fields and schemas

export interface CollectionFieldType {
  name: string;
  type: string;
  required?: boolean;
  isArray?: boolean;
  description?: string;
  defaultValue?: string;
  relationCollection?: string;
}

export interface CollectionSchemaType {
  name: string;
  slug: string;
  description?: string;
  fields: CollectionFieldType[];
}
