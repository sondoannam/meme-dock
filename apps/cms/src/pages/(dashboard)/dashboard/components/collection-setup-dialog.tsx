import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { DialogCustom } from '@/components/custom/dialog-custom';
import { Plus, Save } from 'lucide-react';
import { InputText } from '@/components/custom/form-field/input-text';
import { CollectionFieldsForm } from './collection-fields-form';
import { CollectionFieldType, CUCollectionFieldValues, cuCollectionReqSchema } from '@/validators';
import { Collection } from '@/types';
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
  collections?: Collection[];
  loadingCollections?: boolean;
  onSuccess?: (collections: Collection[]) => void;
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

  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [mode, setMode] = useState<'create' | 'update'>('create');

  const form = useForm<CUCollectionFieldValues>({
    resolver: zodResolver(cuCollectionReqSchema) as any,
    defaultValues: {
      id: '',
      name: '',
      fields: [] as CollectionFieldType[],
    },
  });

  const resetExistingCollection = useCallback(() => {
    setSelectedCollection(null);
    form.reset();
  }, [form]);

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (dialog.isOpen) {
      if (mode === 'create') {
        form.reset({
          id: '',
          name: '',
          fields: [] as CollectionFieldType[],
        });
      }

      return;
    }

    resetExistingCollection();
  }, [dialog.isOpen, form, mode, resetExistingCollection]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedCollection(null);

    if (value === 'new') {
      setMode('create');
      form.reset({
        name: '',
        fields: [] as CollectionFieldType[],
      });
    }
  };
  
  const handleSelectCollection = (collection: Collection & { $id?: string }) => {
    setSelectedCollection(collection);
    setMode('update');
    form.reset({
      id: collection.id,
      name: collection.name,
      fields: Array.isArray(collection.fields) ? collection.fields : ([] as CollectionFieldType[]),
    });
  };

  const handleFieldDefaultValue = (field: CollectionFieldType) => {
    if (field.required || field.type === 'enum' || field.type === 'datetime') {
      return undefined;
    }

    return field.defaultValue;
  };

  const onSubmit = async (data: CUCollectionFieldValues) => {
    setIsSubmitting(true);
    setError(null);

    const { fields, ...restData } = data;
    const payloadData: CUCollectionFieldValues = {
      ...restData,
      fields: fields.map((field: CollectionFieldType) => ({
        ...field,
        defaultValue: handleFieldDefaultValue(field),
      })),
    };

    try {
      let createdCollection: Collection;

      if (mode === 'create') {
        createdCollection = await collectionApi.createCollection(payloadData);
      } else if (mode === 'update' && selectedCollection) {
        const collectionId = selectedCollection.id as string;

        createdCollection = await collectionApi.updateCollection(collectionId, payloadData);
      } else {
        throw new Error('Invalid operation mode');
      }

      form.reset();
      dialog.close();
      onSuccess?.([createdCollection]);

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
  // Handle name change (no longer needed to auto-generate slug)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Name change handler is kept for any future needs
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
                  const isSelected =
                    selectedCollection && selectedCollection.id === collectionItem.id;

                  return (
                    <Card
                      key={collectionItem.id || `collection-${idx}`}
                      className={cn(
                        'cursor-pointer transition-all hover:border-primary',
                        isSelected ? 'border-2 border-primary' : '',
                      )}
                      onClick={() => handleSelectCollection(collectionItem)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="!text-lg">{collectionItem.name}</CardTitle>
                        <CardDescription className="!text-xs">
                          ID: {collectionItem.id ?? 'none'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="!text-sm mt-2">
                          <span className="font-medium">{collectionItem.fields?.length || 0} </span>
                          fields
                        </p>
                        <p className="!text-xs mt-1 text-muted-foreground">
                          {collectionItem.enabled ? 'Enabled' : 'Disabled'} • Updated:{' '}
                          {new Date(collectionItem.updatedAt).toLocaleDateString()}
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
                  <div className="grid grid-cols-1 gap-4">
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
                <div className="grid grid-cols-1 gap-4">
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
