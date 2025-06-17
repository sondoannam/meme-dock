// Define the types for collection fields and schemas

export interface CollectionFieldType {
  name: string;
  type: string;
  required?: boolean;
  isArray?: boolean;
  description?: string;
  defaultValue?: string;
  relationCollection?: string;
  enumValues?: string[];
}

export interface CUCollectionReq {
  id?: string;
  name: string;
  fields: CollectionFieldType[];
}

export interface CollectionRes extends CUCollectionReq {
  id: string;
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
}
