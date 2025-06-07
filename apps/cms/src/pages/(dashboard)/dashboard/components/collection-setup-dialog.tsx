import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { DialogCustom } from '@/components/custom/dialog-custom';
import { Loader2, Save } from 'lucide-react';
import { InputText } from '@/components/custom/form-field/input-text';
import { CollectionFieldsForm } from './collection-fields-form';
import {
  CollectionFieldType,
  CollectionSchemaType,
  collectionSchema,
} from '@/validators/collection-schema';
import { CollectionApi } from '@/services/database';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form } from '@/components/ui/form';
import { DialogInstance } from '@/components/custom/dialog-custom/use-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CollectionSetupDialogProps {
  dialog: DialogInstance;
  onSuccess?: (collections: CollectionSchemaType[]) => void;
}

export const CollectionSetupDialog = ({ dialog, onSuccess }: CollectionSetupDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CollectionSchemaType>({
    resolver: zodResolver(collectionSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      fields: [] as unknown as CollectionFieldType[],
    },
  });

  const onSubmit = async (data: CollectionSchemaType) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await CollectionApi.createCollection(data);
      form.reset();
      dialog.close();
      onSuccess?.([data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  //   Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue(
      'slug',
      name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_-]/g, ''),
    );
  };

  return (
    <DialogCustom dialog={dialog} header="Setup Database Collections" className="max-w-4xl">
      <ScrollArea className="h-[80vh]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 mr-2.5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputText
                control={form.control}
                name="name"
                label="Collection Name"
                placeholder="e.g. Users, Posts, Comments"
                onChange={(e) => {
                  handleNameChange(e);
                }}
                className="mb-auto"
              />

              <InputText
                control={form.control}
                name="slug"
                label="Collection Slug"
                placeholder="e.g. users, posts, comments"
                description="Used as the collection identifier in the database"
              />

              <div className="md:col-span-2">
                <InputText
                  control={form.control}
                  name="description"
                  label="Description"
                  placeholder="Describe the purpose of this collection (optional)"
                  isTextArea={true}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <CollectionFieldsForm />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => dialog.close()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-1">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Collection
              </Button>
            </div>
          </form>
        </Form>
      </ScrollArea>
    </DialogCustom>
  );
};
