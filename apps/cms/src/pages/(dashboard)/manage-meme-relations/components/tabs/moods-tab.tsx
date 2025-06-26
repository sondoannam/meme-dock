import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useDebounceEffect, useRequest } from 'ahooks';
import { multiFieldSearch } from '@/lib/utils';

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
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from '@/components/custom/form-field/input-text';
import { FormDialog } from '@/components/custom/form-dialog';
// import { Slider } from '@/components/ui/slider';

import { translationApi } from '@/services/translate';
import { memeMoodSchema, MemeMoodFormValues } from '@/validators';
import { documentApi, GetDocumentsParams } from '@/services/document';
import { MemeMoodType } from '@/types';
import { InputWithTranslation } from '../input-with-translation';
// import { MoodsBatchCreation } from '@/components/custom/MoodsBatchCreation';

// Trending score color categories
const getTrendingColor = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
};

// const getIntensityColor = (intensity: number) => {
//   if (intensity >= 8) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
//   if (intensity >= 5)
//     return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
//   return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
// };

interface MoodsViewProps {
  moodCollectionId: string;
  moods: MemeMoodType[];
  onRefresh: (params?: GetDocumentsParams) => void;
}

export function MoodsTabView({ moodCollectionId, moods, onRefresh }: MoodsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<MemeMoodType | null>(null);

  // Dialogs
  const cuDialog = DialogCustom.useDialog();
  const deleteDialog = DialogCustom.useDialog();

  const form = useForm<MemeMoodFormValues>({
    resolver: zodResolver(memeMoodSchema),
    defaultValues: {
      label_en: selectedMood ? selectedMood.label_en : '',
      label_vi: selectedMood ? selectedMood.label_vi : '',
      slug: selectedMood ? selectedMood.slug : '',
    },
  });

  const { control, setValue, reset } = form;

  // Watch the form fields to show/hide translation buttons
  const labelEn = useWatch({
    control,
    name: 'label_en',
    defaultValue: selectedMood?.label_en || '',
  });

  const labelVi = useWatch({
    control,
    name: 'label_vi',
    defaultValue: selectedMood?.label_vi || '',
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
        setValue(labelToTranslate, result, { shouldValidate: true });
        toast.success('Translated successfully');
      },
      onError: (error) => {
        toast.error(`Translation failed: ${error.message}`);
      },
    },
  );

  const handleOpenCreate = () => {
    setSelectedMood(null);
    reset();
    cuDialog.open();
  };

  const handleOpenUpdate = (mood: MemeMoodType) => {
    setSelectedMood(mood);
    reset({
      label_en: mood.label_en,
      label_vi: mood.label_vi,
      slug: mood.slug,
    });
    cuDialog.open();
  };

  const handleCloseCUDialog = () => {
    cuDialog.close();
    setSelectedMood(null);
    reset();
  };

  const handleOpenDelete = (mood: MemeMoodType) => {
    setSelectedMood(mood);
    deleteDialog.open();
  };

  const handleCloseDelete = () => {
    deleteDialog.close();
    setSelectedMood(null);
  };

  const createOrUpdateMood = async (data: MemeMoodFormValues) => {
    const defaultPayload: Partial<MemeMoodType> = {
      usageCount: 0,
      trendingScore: 0.0,
      ...data,
    };

    if (selectedMood) {
      return documentApi.updateDocument<MemeMoodType>(
        moodCollectionId,
        selectedMood.id,
        defaultPayload,
      );
    }
    return documentApi.createDocument<MemeMoodType>(moodCollectionId, defaultPayload);
  };

  // Delete mood
  const { run: deleteMood, loading: isDeleting } = useRequest(
    () => {
      if (!selectedMood || !selectedMood.id) {
        return Promise.reject(new Error('No mood selected for deletion'));
      }

      return documentApi.deleteDocument(moodCollectionId, selectedMood.id);
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success('Mood deleted successfully!');
        handleCloseDelete();
        onRefresh();
      },
      onError: (error: Error) => {
        toast.error(`Failed to delete mood: ${error.message}`);
      },
    },
  );

  // Handle form submission
  const onSubmit = async (values: MemeMoodFormValues) => {
    try {
      await createOrUpdateMood(values);

      toast.success(selectedMood ? 'Mood updated successfully!' : 'Mood created successfully!');
      handleCloseCUDialog();
      onRefresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to ${selectedMood ? 'update' : 'create'} mood: ${errorMessage}`);
    }
  }; // Handle delete is now directly passed to DialogCustom component through onConfirmDelete

  // Filter moods based on search query using the enhanced multi-field search
  const filteredMoods = useMemo(
    () =>
      moods.filter((mood) =>
        searchQuery
          ? multiFieldSearch(mood, searchQuery, ['label_en', 'label_vi', 'slug'], {
              normalizeAccents: true, // Helps with Vietnamese diacritics
            })
          : true
      ),
    [moods, searchQuery],
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
          placeholder="Search moods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-2">
          {/* One-time batch creation button - Delete or comment out after use */}
          {/* {moods.length === 0 && (
            <MoodsBatchCreation 
              collectionId={moodCollectionId}
              onComplete={() => setTimeout(() => onRefresh(), 500)} 
            />
          )} */}

          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Mood
          </Button>
        </div>
      </div>
      {/* Grid of moods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {filteredMoods.map((mood) => (
          <Card key={mood.id} className="overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="!text-lg">{mood.label_en}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenUpdate(mood)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleOpenDelete(mood)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-foreground/80">{mood.label_vi}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="!text-sm text-muted-foreground space-y-2">
                <div>
                  <span className="font-medium">Slug: </span>
                  <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                    {mood.slug}
                  </span>
                </div>
                {/* {mood.intensity !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Intensity:</span>
                    <Badge className={getIntensityColor(mood.intensity)}>{mood.intensity}/10</Badge>
                  </div>
                )} */}
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex flex-wrap gap-2">
              {mood.usageCount !== undefined && (
                <Badge variant="outline" className="bg-secondary/50">
                  Used: {mood.usageCount} times
                </Badge>
              )}
              {mood.trendingScore !== undefined && (
                <Badge className={getTrendingColor(mood.trendingScore)}>
                  Trending: {mood.trendingScore}%
                </Badge>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      {filteredMoods.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No moods found. Try a different search or add a new mood.
        </div>
      )}
      {/* Create/Edit Dialog */}{' '}
      <FormDialog
        form={form}
        dialog={cuDialog}
        header={selectedMood ? 'Edit Mood' : 'Add New Mood'}
        onSubmit={onSubmit}
        submitText={selectedMood ? 'Save Changes' : 'Add Mood'}
        onClose={handleCloseCUDialog}
      >
        <div className="grid gap-4 py-4">
          <InputWithTranslation
            name="label_en"
            label="English Label"
            placeholder="e.g. Happy"
            control={control}
            appear={!!labelVi}
            translateFn={() => translateLabel(labelVi, 'vi')}
            isTranslating={isTranslating}
            tooltipContent="Translate from Vietnamese to English"
          />

          <InputWithTranslation
            name="label_vi"
            label="Vietnamese Label"
            placeholder="e.g. Vui vẻ"
            control={control}
            appear={!!labelEn}
            translateFn={() => translateLabel(labelEn, 'en')}
            isTranslating={isTranslating}
            tooltipContent="Translate from English to Vietnamese"
          />

          <InputText name="slug" label="Slug" placeholder="e.g. happy" control={control} />
          {/* <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Intensity: {intensityValue}/10
            </label>
            <Slider 
              defaultValue={[intensityValue]} 
              max={10} 
              min={1} 
              step={1}
              onValueChange={handleIntensityChange}
              className="py-2"
            />
            <p className="text-sm text-muted-foreground">
              How intense is this emotion (1-10)
            </p>
          </div> */}
        </div>
      </FormDialog>
      {/* Delete Confirmation Dialog */}
      <DialogCustom
        dialog={deleteDialog}
        isConfirmDelete={true}
        header="Delete Mood"
        onConfirmDelete={deleteMood}
        onCloseDelete={handleCloseDelete}
        deleteLoading={isDeleting}
      >
        <p>
          Are you sure you want to delete <strong>{selectedMood?.label_en}</strong>?
        </p>
        <p className="text-muted-foreground mt-2">
          This action cannot be undone. This will permanently delete the mood and any relationships.
        </p>
      </DialogCustom>
    </div>
  );
}
