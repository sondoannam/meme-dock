import { useState, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDebounceEffect, useRequest } from 'ahooks';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DialogCustom } from '@/components/custom/dialog-custom';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from '@/components/custom/form-field/input-text';
import { FormDialog } from '@/components/custom/form-dialog';

import { memeObjectSchema, MemeObjectFormValues } from '@/validators';
import { documentApi, GetDocumentsParams } from '@/services/document';
import { MemeObjectType } from '@/types';
import { translationApi } from '@/services/translate';
import { InputWithTranslation } from '../input-with-translation';

// Trending score color categories
const getTrendingColor = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
};

interface ObjectsViewProps {
  objectCollectionId: string;
  objects: MemeObjectType[];
  onRefresh: (params?: GetDocumentsParams) => void;
}

export function ObjectsTabView({ objectCollectionId, objects, onRefresh }: ObjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObject, setSelectedObject] = useState<MemeObjectType | null>(null);

  // Dialogs
  const cuDialog = DialogCustom.useDialog();
  const deleteDialog = DialogCustom.useDialog();

  const form = useForm<MemeObjectFormValues>({
    resolver: zodResolver(memeObjectSchema),
    defaultValues: {
      label_en: selectedObject ? selectedObject.label_en : '',
      label_vi: selectedObject ? selectedObject.label_vi : '',
      slug: selectedObject ? selectedObject.slug : '',
    },
  });

  const { control, setValue, reset } = form;

  const labelEn = useWatch({
    control,
    name: 'label_en',
    defaultValue: selectedObject?.label_en || '',
  });

  const labelVi = useWatch({
    control,
    name: 'label_vi',
    defaultValue: selectedObject?.label_vi || '',
  });

  const { run: translateLabel, loading: isTranslating } = useRequest(
    async (text: string, labelToTranslate: 'en' | 'vi') => {
      if (!text) {
        toast.error('No text to translate');
        throw new Error('No text to translate');
      }

      const translatedLabel = labelToTranslate === 'en' ? 'vi' : 'en';

      return translationApi.translateSimple({
        text,
        from: labelToTranslate,
        to: translatedLabel,
      });
    },
    {
      manual: true,
      onSuccess: (result, params) => {
        const labelToTranslate = params[1] === 'en' ? 'label_vi' : 'label_en';
        setValue(labelToTranslate, result);
        toast.success('Translated successfully');
      },
      onError: (error) => {
        toast.error(`Translation failed: ${error.message}`);
      },
    },
  );

  const handleOpenCreate = () => {
    setSelectedObject(null);
    reset();
    cuDialog.open();
  };

  const handleOpenUpdate = (object: MemeObjectType) => {
    setSelectedObject(object);
    reset({
      label_en: object.label_en,
      label_vi: object.label_vi,
      slug: object.slug,
    });
    cuDialog.open();
  };

  const handleOpenDelete = (object: MemeObjectType) => {
    setSelectedObject(object);
    deleteDialog.open();
  };

  const handleCloseCUDialog = () => {
    cuDialog.close();
    setSelectedObject(null);
    reset();
  };

  const handleCloseDeleteDialog = () => {
    deleteDialog.close();
    setSelectedObject(null);
  };

  const createOrUpdateObject = async (data: MemeObjectFormValues) => {
    const defaultPayload: Partial<MemeObjectType> = {
      usageCount: 0,
      trendingScore: 0.0,
      ...data,
    };
    if (selectedObject) {
      return documentApi.updateDocument<MemeObjectType>(
        objectCollectionId,
        selectedObject.id,
        defaultPayload,
      );
    }
    return documentApi.createDocument<MemeObjectType>(objectCollectionId, defaultPayload);
  };

  // Delete object
  const { run: deleteObject, loading: isDeleting } = useRequest(
    () => {
      if (!selectedObject || !selectedObject.id) {
        return Promise.reject(new Error('No object selected for deletion'));
      }
      return documentApi.deleteDocument(objectCollectionId, selectedObject.id);
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success('Object deleted successfully!');
        handleCloseDeleteDialog();
        onRefresh();
      },
      onError: (error: Error) => {
        toast.error(`Failed to delete object: ${error.message}`);
      },
    },
  );

  // Handle form submission
  const onSubmit = async (values: MemeObjectFormValues) => {
    try {
      await createOrUpdateObject(values);
      toast.success(
        selectedObject ? 'Object updated successfully!' : 'Object created successfully!',
      );
      handleCloseCUDialog();
      onRefresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to ${selectedObject ? 'update' : 'create'} object: ${errorMessage}`);
    }
  }; // Delete is now handled by onConfirmDelete in DialogCustom

  // Filter objects based on search query
  const filteredObjects = useMemo(
    () =>
      objects.filter(
        (object) =>
          object.label_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
          object.label_vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          object.slug.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [objects, searchQuery],
  );

  useDebounceEffect(
    () => {
      const formattedLabel = labelEn.trim().toLowerCase().replace(/\s+/g, '-');
      setValue('slug', formattedLabel);
    },
    [labelEn],
    {
      wait: 500,
    },
  );

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center">
        <Input
          className="max-w-sm"
          placeholder="Search objects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Object
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {filteredObjects.map((object) => (
          <Card key={object.id} className="overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{object.label_en}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenUpdate(object)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleOpenDelete(object)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-foreground/80">{object.label_vi}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Slug: </span>
                <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                  {object.slug}
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex flex-wrap gap-2">
              {object.usageCount !== undefined && (
                <Badge variant="outline" className="bg-secondary/50">
                  Used: {object.usageCount} times
                </Badge>
              )}
              {object.trendingScore !== undefined && (
                <Badge className={getTrendingColor(object.trendingScore)}>
                  Trending: {object.trendingScore}%
                </Badge>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredObjects.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No objects found. Try a different search or add a new object.
        </div>
      )}

      <FormDialog
        form={form}
        dialog={cuDialog}
        header={selectedObject ? 'Edit Object' : 'Add New Object'}
        onSubmit={onSubmit}
        submitText={selectedObject ? 'Save Changes' : 'Add Object'}
        onClose={handleCloseCUDialog}
      >
        <div className="grid gap-4 py-4">
          <InputWithTranslation
            name="label_en"
            label="English Label"
            placeholder="e.g. Person"
            control={control}
            appear={!!labelVi}
            translateFn={() => translateLabel(labelVi, 'vi')}
            isTranslating={isTranslating}
            tooltipContent="Translate from Vietnamese to English"
          />
          <InputWithTranslation
            name="label_vi"
            label="Vietnamese Label"
            placeholder="e.g. Người"
            control={control}
            appear={!!labelEn}
            translateFn={() => translateLabel(labelEn, 'en')}
            isTranslating={isTranslating}
            tooltipContent="Translate from English to Vietnamese"
          />

          <InputText name="slug" label="Slug" placeholder="e.g. person" control={form.control} />
        </div>
      </FormDialog>

      <DialogCustom
        dialog={deleteDialog}
        isConfirmDelete={true}
        header="Delete Object"
        onConfirmDelete={deleteObject}
        onCloseDelete={handleCloseDeleteDialog}
        deleteLoading={isDeleting}
      >
        <p>
          Are you sure you want to delete <strong>{selectedObject?.label_en}</strong>?
        </p>
        <p className="text-muted-foreground mt-2">
          This action cannot be undone. This will permanently delete the object and any
          relationships.
        </p>
      </DialogCustom>
    </div>
  );
}
