import { Button } from '@/components/ui/button';
import { Trash2, Plus, Clock } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { InputText } from '@/components/custom/form-field/input-text';
import { InputSimpleSelect } from '@/components/custom/form-field/input-simple-select';
import { InputTagsCustom } from '@/components/custom/form-field/input-tags-custom';
import { FieldType, fieldTypes, type CollectionFieldType } from '@/validators';
import { Card, CardContent } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export const CollectionFieldsForm = () => {
  const { control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });

  // Function to add a new field
  const addField = () => {
    const newField: CollectionFieldType = {
      name: '',
      type: 'string',
      required: false,
      isArray: false,
      description: '',
      defaultValue: '',
      enumValues: [],
    };
    append(newField);
  };

  const hasCreatedAtField = fields.some((_, index) => {
    const fieldObj = watch(`fields.${index}`);
    return fieldObj?.name === 'createdAt';
  });

  const hasUpdatedAtField = fields.some((_, index) => {
    const fieldObj = watch(`fields.${index}`);
    return fieldObj?.name === 'updatedAt';
  });

  const hasTimestampFields = hasCreatedAtField && hasUpdatedAtField;

  // Function to add timestamp fields (createdAt and updatedAt)
  const addTimestampFields = () => {
    const createdAtField: CollectionFieldType = {
      name: 'createdAt',
      type: 'datetime',
      required: true,
      isArray: false,
      description: 'Record creation timestamp',
      defaultValue: '',
    };

    const updatedAtField: CollectionFieldType = {
      name: 'updatedAt',
      type: 'datetime',
      required: true,
      isArray: false,
      description: 'Record last update timestamp',
      defaultValue: '',
    };

    // Add both timestamp fields
    append(createdAtField);
    append(updatedAtField);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Collection Fields</h3>
        <Button
          type="button"
          onClick={addField}
          variant="outline"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="flex justify-center p-4 text-center text-muted-foreground">
          <div>No fields added yet. Click "Add Field" to create your first field.</div>
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const fieldType = watch(`fields.${index}.type`) as FieldType;
          const isRequired = watch(`fields.${index}.required`) as boolean;
          const isEnum = fieldType === 'enum';

          return (
            <Card key={field.id} className="relative overflow-visible">
              <CardContent className="pt-6">
                <div className="absolute -top-3 right-3">
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    size="sm"
                    variant="destructive"
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 my-4">
                  <InputText
                    control={control}
                    name={`fields.${index}.name`}
                    label="Field Name"
                    placeholder="e.g. title, description, is_active"
                    className="sm:col-span-2 [&>input]:!border shadow-sm"
                  />
                  <InputSimpleSelect
                    control={control}
                    name={`fields.${index}.type`}
                    label="Field Type"
                    options={fieldTypes}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-4 w-full">
                    <FormField
                      control={control}
                      name={`fields.${index}.required`}
                      render={({ field }) => (
                        <FormItem className="w-full flex flex-row items-center justify-between rounded-md border p-2.5 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Required</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center space-x-4 w-full">
                    <FormField
                      control={control}
                      name={`fields.${index}.isArray`}
                      render={({ field }) => (
                        <FormItem
                          className={cn(
                            'w-full flex flex-row items-center justify-between rounded-md border p-2.5 shadow-sm',
                            isEnum && 'cursor-not-allowed',
                          )}
                        >
                          <div className="space-y-0.5">
                            <FormLabel>Is Array</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              aria-readonly
                              className={isEnum ? 'cursor-not-allowed' : undefined}
                              disabled={isEnum}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 my-4">
                  <InputText
                    control={control}
                    name={`fields.${index}.description`}
                    label="Description"
                    placeholder="Field description (optional)"
                  />

                  {!isRequired && (
                    <>
                      {(fieldType === 'string' || fieldType === 'number') && (
                        <InputText
                          control={control}
                          name={`fields.${index}.defaultValue`}
                          label="Default Value"
                          placeholder="Default value (optional)"
                        />
                      )}

                      {fieldType === 'boolean' && (
                        <InputSimpleSelect
                          control={control}
                          name={`fields.${index}.defaultValue`}
                          label="Default Value"
                          placeholder="Default value (optional)"
                          options={[
                            { id: 'true', value: 'true', label: 'True' },
                            { id: 'false', value: 'false', label: 'False' },
                          ]}
                        />
                      )}

                      {fieldType === 'relation' && (
                        <InputText
                          control={control}
                          name={`fields.${index}.relationCollection`}
                          label="Related Collection"
                          placeholder="e.g. users, tags, categories"
                        />
                      )}

                      {fieldType === 'enum' && (
                        <InputTagsCustom
                          control={control}
                          name={`fields.${index}.enumValues`}
                          label="Enum Values"
                          placeholder="Enter values and press Enter..."
                          description="Add each possible enum value and press Enter after each one"
                        />
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {fields.length > 0 && (
          <div className="flex justify-center gap-3 mt-6">
            <Button
              type="button"
              onClick={addField}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Another Field
            </Button>
            {!hasTimestampFields && (
              <Button
                type="button"
                onClick={addTimestampFields}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <Clock className="h-4 w-4" />
                Add Timestamps
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
