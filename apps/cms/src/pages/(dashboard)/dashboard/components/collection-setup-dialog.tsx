import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { DialogCustom } from '@/components/custom/dialog-custom';
import { Plus, Save } from 'lucide-react';
import { InputText } from '@/components/custom/form-field/input-text';
import { CollectionFieldsForm } from './collection-fields-form';
import { CollectionFieldType, CollectionSchemaType, collectionSchema } from '@/validators';
import { collectionApi } from '@/services/collection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form } from '@/components/ui/form';
import { DialogInstance } from '@/components/custom/dialog-custom/use-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SmallLoading, InlineLoading } from '@/components/custom/loading';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CollectionSetupDialogProps {
  dialog: DialogInstance;
  collections?: CollectionSchemaType[];
  loadingCollections?: boolean;
  onSuccess?: (collections: CollectionSchemaType[]) => void;
}

export const CollectionSetupDialog = ({
  dialog,
  collections = [],
  loadingCollections = false,
  onSuccess,
}: CollectionSetupDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('new');
  // Define extended type for collections that might include IDs from the backend
  type CollectionWithId = CollectionSchemaType & { $id?: string; id?: string };

  const [selectedCollection, setSelectedCollection] = useState<CollectionWithId | null>(null);
  const [mode, setMode] = useState<'create' | 'update'>('create');

  const form = useForm<CollectionSchemaType>({
    resolver: zodResolver(collectionSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      fields: [] as CollectionFieldType[],
    },
  });

  function resetExistingCollection() {
    setSelectedCollection(null);
    form.reset();
  }

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (dialog.isOpen) {
      if (mode === 'create') {
        form.reset({
          name: '',
          slug: '',
          description: '',
          fields: [] as CollectionFieldType[],
        });
      }

      return;
    }

    resetExistingCollection();
  }, [dialog.isOpen, form, mode]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedCollection(null);

    if (value === 'new') {
      setMode('create');
      form.reset({
        name: '',
        slug: '',
        description: '',
        fields: [] as CollectionFieldType[],
      });
    }
  };

  // Handle selecting a collection to edit
  const handleSelectCollection = (collection: CollectionSchemaType & { id?: string }) => {
    setSelectedCollection(collection);
    setMode('update');
    form.reset({
      ...collection,
      fields: Array.isArray(collection.fields) ? collection.fields : ([] as CollectionFieldType[]),
    });
  };

  const handleFieldDefaultValue = (field: CollectionFieldType) => {
    if (field.required || field.type === 'enum' || field.type === 'datetime') {
      return undefined;
    }

    return field.defaultValue;
  };

  const onSubmit = async (data: CollectionSchemaType) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'create') {
        await collectionApi.createCollection(data);
      } else if (mode === 'update' && selectedCollection) {
        const collectionId =
          selectedCollection.$id || selectedCollection.id || selectedCollection.slug;

        const { fields, ...restData } = data;
        const updateData: CollectionSchemaType = {
          ...restData,
          fields: fields.map((field) => ({
            ...field,
            defaultValue: handleFieldDefaultValue(field),
          })),
        };

        await collectionApi.updateCollection(collectionId, updateData);
      }

      form.reset();
      dialog.close();
      onSuccess?.([data]);

      toast.success(`Collection ${mode === 'create' ? 'created' : 'updated'} successfully!`);
    } catch (err) {
      const action = mode === 'create' ? 'create' : 'update';
      const errMsg = `Failed to ${action} collection: ${
        err instanceof Error ? err.message : 'Unknown error'
      }`;
      setError(errMsg);
      console.error('Error calling API:', err);
      toast.error(errMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  //   Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Only auto-generate slug if it's empty or in create mode
    if (mode === 'create' || !form.getValues('slug')) {
      form.setValue(
        'slug',
        name
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_-]/g, ''),
      );
    }
  };

  if (loadingCollections) {
    return <SmallLoading />;
  }

  return (
    <DialogCustom
      dialog={dialog}
      header="Database Collections"
      className="max-w-5xl"
      isDisableClickOutside
    >
      <ScrollArea className="h-[80vh] pr-2.5">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Collections</TabsTrigger>
            <TabsTrigger value="new">New Collection</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="mt-4">
            {collections.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No collections found.</p>
                <Button
                  onClick={() => setActiveTab('new')}
                  variant="outline"
                  className="mt-4 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Create New Collection
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collections.map((collectionItem, idx) => {
                  // Cast to our extended collection type
                  const collection = collectionItem as CollectionWithId;
                  const collectionId = collection.$id || collection.id;
                  const isSelected =
                    selectedCollection &&
                    ((selectedCollection.$id && selectedCollection.$id === collection.$id) ||
                      (selectedCollection.id && selectedCollection.id === collection.id) ||
                      selectedCollection.slug === collection.slug);

                  return (
                    <Card
                      key={collectionId || `collection-${idx}`}
                      className={cn(
                        'cursor-pointer transition-all hover:border-primary',
                        isSelected ? 'border-2 border-primary' : '',
                      )}
                      onClick={() => handleSelectCollection(collection)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="!text-lg">{collection.name}</CardTitle>
                        <CardDescription className="!text-xs">
                          Slug: {collection.slug ?? 'none'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="!text-sm text-muted-foreground">
                          {collection.description ?? 'No description provided'}
                        </p>
                        <p className="!text-sm mt-2">
                          <span className="font-medium">{collection.fields?.length || 0} </span>
                          attributes
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            {selectedCollection && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6 py-4 mt-6 border-t"
                >
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
                      className="mb-auto cursor-not-allowed"
                      readOnly
                    />

                    <InputText
                      control={form.control}
                      name="slug"
                      label="Collection Slug"
                      placeholder="e.g. users, posts, comments"
                      description="Used as the collection identifier in the database"
                      className="cursor-not-allowed"
                      readOnly
                    />

                    <div className="md:col-span-2">
                      <InputText
                        control={form.control}
                        name="description"
                        label="Description"
                        placeholder="Describe the purpose of this collection (optional)"
                        isTextArea={true}
                        className="cursor-not-allowed"
                        readOnly
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
                      onClick={resetExistingCollection}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>{' '}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-1"
                    >
                      {isSubmitting ? <InlineLoading size="sm" /> : <Save className="h-4 w-4" />}
                      Update Collection
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </TabsContent>

          <TabsContent value="new" className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
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
                  </Button>{' '}
                  <Button type="submit" disabled={isSubmitting} className="flex items-center gap-1">
                    {isSubmitting ? <InlineLoading size="sm" /> : <Save className="h-4 w-4" />}
                    Save Collection
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </DialogCustom>
  );
};
