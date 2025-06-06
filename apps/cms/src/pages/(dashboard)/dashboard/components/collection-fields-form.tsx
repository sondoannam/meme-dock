import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { InputText } from '@/components/custom/form-field/input-text';
import { InputSimpleSelect } from '@/components/custom/form-field/input-simple-select';
import { fieldTypes, type CollectionFieldType } from '@/validators/collection-schema';
import { Card, CardContent } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { SelectOption } from '@/components/custom/basic-select';

export const CollectionFieldsForm = () => {
  const { control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });

  // Function to add a new field
  const addField = () => {
    append({
      name: '',
      type: 'string',
      required: false,
      isArray: false,
    } as CollectionFieldType);
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
          const fieldType = watch(`fields.${index}.type`);

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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputText
                    control={control}
                    name={`fields.${index}.name`}
                    label="Field Name"
                    placeholder="e.g. title, description, is_active"
                  />
                  <InputSimpleSelect
                    control={control}
                    name={`fields.${index}.type`}
                    label="Field Type"
                    options={fieldTypes as unknown as SelectOption[]}
                  />

                  <div className="flex items-center space-x-4">
                    <FormField
                      control={control}
                      name={`fields.${index}.required`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
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

                  <div className="flex items-center space-x-4">
                    <FormField
                      control={control}
                      name={`fields.${index}.isArray`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Is Array</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <InputText
                    control={control}
                    name={`fields.${index}.description`}
                    label="Description"
                    placeholder="Field description (optional)"
                  />

                  <InputText
                    control={control}
                    name={`fields.${index}.defaultValue`}
                    label="Default Value"
                    placeholder="Default value (optional)"
                  />

                  {fieldType === 'relation' && (
                    <InputText
                      control={control}
                      name={`fields.${index}.relationCollection`}
                      label="Related Collection"
                      placeholder="e.g. users, tags, categories"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
