import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { MemeDocument } from '@/types';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InputText } from '@/components/custom/form-field/input-text';
import { InputSimpleSelect } from '@/components/custom/form-field/input-simple-select';
import MultipleSelector, {
  Option as MultipleSelectorOption,
} from '@/components/ui/multiple-selector';
import { SelectOption } from '@/components/custom/basic-select';
import { DialogCustom } from '@/components/custom/dialog-custom';
import { DialogInstance } from '@/components/custom/dialog-custom/use-dialog';
import { FileInput, FileUploader, FileUploaderContent } from '@/components/ui/file-upload-dropzone';

import { ImageUploadFormValues, imageUploadSchema } from '@/validators';
import imageApi from '@/services/image';
import memeApi, { CreateMemeParams } from '@/services/meme';
import { useMemeCollectionStore } from '@/stores/meme-store';
import { Icons } from '@/components/icons';
import { X } from 'lucide-react';
import { IMAGE_PLATFORM } from '@/enums';
import { getAppwriteImageUrl } from '@/lib/utils';
import { useUpdateEffect } from 'ahooks';

export interface ImageUploadDialogProps {
  dialog: DialogInstance;
  relationOptions: {
    tags: SelectOption[];
    objects: SelectOption[];
    moods: SelectOption[];
  };
  onSuccess: () => void;
  selectedMeme?: MemeDocument; // Optional meme for update mode
}

// Helper function to convert SelectOption to MultipleSelectorOption
const convertToMultipleSelectorOptions = (options: SelectOption[]): MultipleSelectorOption[] => {
  return options.map((option) => ({
    value: option.value,
    label: option.label,
    id: option.id,
  }));
};

export function ImageUploadDialog({
  dialog,
  relationOptions,
  onSuccess,
  selectedMeme,
}: ImageUploadDialogProps) {
  const dialogInstance = DialogCustom.useDialog(dialog);
  const [files, setFiles] = useState<File[] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [isUpdateMode, setIsUpdateMode] = useState<boolean>(false);

  const memeCollection = useMemeCollectionStore((state) => state.memeCollection);
  const form = useForm<ImageUploadFormValues>({
    resolver: zodResolver(imageUploadSchema, {
      async: true,
    }) as any,
    defaultValues: {
      title_en: '',
      title_vi: '',
      description: '',
      tags: [],
      objects: [],
      moods: [],
      imageFile: [],
      platform: 'appwrite',
    },
    context: { isUpdateMode: Boolean(selectedMeme) },
  });

  const {
    control,
    formState: { isSubmitting, errors },
    handleSubmit,
    setValue,
  } = form;

  const onSubmit = async (data: ImageUploadFormValues) => {
    if (!memeCollection) {
      toast.error('Meme collection not found');
      return;
    }

    // Validate file input based on mode
    if (!isUpdateMode && (!files || files.length === 0)) {
      toast.error('Image is required for new memes');
      return;
    }

    try {
      // Show loading state
      const loadingMessage = isUpdateMode ? 'Updating meme...' : 'Uploading image...';
      toast.loading(loadingMessage);
      if (isUpdateMode && selectedMeme) {
        // Update mode - keep existing file if no new one is uploaded
        const memeParams: Partial<CreateMemeParams> = {
          title_en: data.title_en,
          title_vi: data.title_vi,
          desc_en: data.description,
          desc_vi: data.description,
          tagIds: data.tags || [],
          objectIds: data.objects || [],
          moodIds: data.moods || [],
        };

        // Only upload a new image if files are provided
        if (files && files.length > 0) {
          const fileName = `${data.title_en}-${data.title_vi}`.replace(/\s+/g, '-').toLowerCase();
          try {
            // Upload new image
            const imageResult = await imageApi.uploadImage(files[0], {
              platform: data.platform,
              fileName,
              tags: data.tags,
            });

            // Update file information
            memeParams.fileId = imageResult.data.id;
            memeParams.saved_platform = data.platform;
          } catch {
            toast.dismiss();
            toast.error('Failed to upload the new image. Please try again.');
            return;
          }
        }

        // Update the meme document
        await memeApi.updateMeme(memeCollection.id, selectedMeme.id, memeParams);
        toast.dismiss();
        toast.success('Meme updated successfully!');
      } else {
        // Create mode - files are required
        if (!files || files.length === 0) {
          toast.dismiss();
          toast.error('No image file selected');
          return;
        }

        // Generate filename from titles
        const fileName = `${data.title_en}-${data.title_vi}`.replace(/\s+/g, '-').toLowerCase();

        // Step 1: Upload image to the selected platform
        const imageResult = await imageApi.uploadImage(files[0], {
          platform: data.platform,
          fileName,
          tags: data.tags, // Pass tags as additional metadata
        });

        // Step 2: Create meme document with the uploaded image ID
        const memeParams = memeApi.transformFormToApiParams(
          data,
          imageResult.data.id,
          imageResult.data.thumbnailUrl || null,
          data.platform,
        );
        await memeApi.createMeme(memeCollection.id, memeParams);

        toast.dismiss();
        toast.success('Meme uploaded successfully!');
      }

      handleClose();
      onSuccess?.();
    } catch (error) {
      toast.dismiss(); // Remove loading toast
      console.error('Error handling meme:', error);
      toast.error(
        error instanceof Error ? `Operation failed: ${error.message}` : 'Operation failed',
      );
    }
  };

  const handleClose = () => {
    form.reset();
    setFiles(null);
    dialogInstance.close();
  };

  // Handle image removal with proper cleanup
  const handleImageRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the file input
    e.preventDefault(); // Prevent any default behavior

    // Clean up resources
    if (previewUrl) {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    }

    // Reset state
    setPreviewUrl(undefined);
    setFiles(null);
    setValue('imageFile', [], { shouldValidate: false });
  };

  useEffect(() => {
    if (selectedMeme) {
      setIsUpdateMode(true);

      // Populate form with selected meme data
      form.reset({
        title_en: selectedMeme.title_en || '',
        title_vi: selectedMeme.title_vi || '',
        description: selectedMeme.desc_en || '',
        tags: selectedMeme.tagIds || [],
        objects: selectedMeme.objectIds || [],
        moods: selectedMeme.moodIds || [],
        imageFile: [], // Can't populate File objects directly
        platform: selectedMeme.saved_platform || 'appwrite',
      });
      console.log('set selected meme:', selectedMeme.saved_platform === IMAGE_PLATFORM.APPWRITE);
      if (selectedMeme.saved_platform === IMAGE_PLATFORM.APPWRITE) {
        setPreviewUrl(
          getAppwriteImageUrl(selectedMeme.fileId, 'preview', {
            width: 400,
            height: 400,
            quality: 80,
          }),
        );
      }
    } else {
      setIsUpdateMode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMeme]);

  useEffect(() => {
    if (!files || files.length === 0) return;

    // If we're in update mode and adding a new file, clear the previous preview URL
    if (isUpdateMode && previewUrl) {
      // Only revoke if it's an object URL (not a remote URL)
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    }

    const url = URL.createObjectURL(files[0]);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [files]);

  useUpdateEffect(() => {
    if (!dialog.isOpen) {
      setFiles(null);
      setPreviewUrl(undefined);
      setIsUpdateMode(false);
      form.reset();
    }
  }, [dialog.isOpen]);

  return (
    <DialogCustom
      dialog={dialog}
      header={
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            {isUpdateMode ? 'Update Meme' : 'Upload New Meme Image'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isUpdateMode
              ? 'Update meme details or replace the image'
              : 'Add a new meme image to your collection with tags, objects and moods.'}
          </p>
        </div>
      }
      className="!max-w-[800px] w-full"
      isDisableClickOutside
    >
      <ScrollArea className="h-[70vh] pr-2.5 w-full">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-1">
            {/* Image Dropzone */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Image</h3>
              <FileUploader
                value={files}
                onValueChange={(newFiles: File[] | null) => {
                  setFiles(newFiles);
                  if (newFiles && newFiles.length > 0) {
                    setValue('imageFile', newFiles, {
                      shouldValidate: false, // Set to false to prevent validation loops
                    });
                  } else {
                    setValue('imageFile', [], { shouldValidate: false });
                  }
                }}
                dropzoneOptions={{
                  accept: {
                    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                  },
                  maxFiles: 1,
                  maxSize: 5 * 1024 * 1024, // 5MB
                  multiple: false,
                  noClick: false, // Always allow clicking the dropzone
                  onDrop: () => {
                    console.log('File dropped');
                  },
                }}
              >
                <FileUploaderContent>
                  <FileInput className="h-[200px] cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-md hover:bg-accent/50 transition-colors relative">
                    {(files && files.length > 0) || (previewUrl && isUpdateMode) ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="object-contain w-full h-full"
                          style={{ pointerEvents: 'none' }} // Prevent image from capturing clicks
                        />
                        <div className="absolute top-2 right-2 z-50">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-sm !bg-destructive hover:!bg-destructive/90 text-destructive-foreground"
                            onClick={handleImageRemove}
                          >
                            <X className="!h-4 !w-4" />
                            <span className="sr-only">Remove image</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-5">
                        <Icons.Image className="!h-10 !w-10 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Drag & drop image here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Max file size: 5MB</p>
                      </div>
                    )}
                  </FileInput>
                </FileUploaderContent>
              </FileUploader>
              {errors.imageFile && (
                <p className="text-sm text-destructive">{errors.imageFile.message}</p>
              )}
              {!isUpdateMode && !files && !previewUrl && (
                <p className="text-sm text-amber-500">Image is required for new memes</p>
              )}
            </div>
            {/* Title fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputText
                control={control}
                name="title_en"
                label="English Title"
                placeholder="Funny Cat"
              />
              <InputText
                control={control}
                name="title_vi"
                label="Vietnamese Title"
                placeholder="Mèo Hài Hước"
              />
              <InputSimpleSelect
                control={control}
                name="platform"
                label="Storage Platform"
                options={[
                  { id: '1', value: 'appwrite', label: 'Appwrite' },
                  { id: '2', value: 'imagekit', label: 'ImageKit' },
                ]}
                description="Select the platform to store the image"
              />
            </div>

            <InputText
              control={control}
              name="description"
              label="Description"
              placeholder="Enter a brief description of this meme image"
              isTextArea={true}
            />
            {/* Relation fields */}
            <div className="grid grid-cols-1 gap-4">
              {/* Tags Selection */}
              <FormField
                control={control}
                name="tags"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <MultipleSelector
                        defaultOptions={convertToMultipleSelectorOptions(relationOptions.tags)}
                        placeholder="Select tags"
                        value={
                          field.value
                            ? field.value.map((tagId) => {
                                const option = relationOptions.tags.find(
                                  (tag) => tag.value === tagId,
                                );
                                return option
                                  ? { value: option.value, label: option.label }
                                  : { value: tagId, label: tagId };
                              })
                            : []
                        }
                        onChange={(options: MultipleSelectorOption[]) => {
                          field.onChange(
                            options.map((option: MultipleSelectorOption) => option.value),
                          );
                        }}
                        badgeClassName="bg-primary/10 text-primary hover:bg-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Objects Selection */}
              <FormField
                control={control}
                name="objects"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Objects</FormLabel>
                    <FormControl>
                      <MultipleSelector
                        defaultOptions={convertToMultipleSelectorOptions(relationOptions.objects)}
                        placeholder="Select objects"
                        value={
                          field.value
                            ? field.value.map((objectId) => {
                                const option = relationOptions.objects.find(
                                  (obj) => obj.value === objectId,
                                );
                                return option
                                  ? { value: option.value, label: option.label }
                                  : { value: objectId, label: objectId };
                              })
                            : []
                        }
                        onChange={(options: MultipleSelectorOption[]) => {
                          field.onChange(
                            options.map((option: MultipleSelectorOption) => option.value),
                          );
                        }}
                        badgeClassName="bg-secondary text-primary hover:bg-secondary/20 !py-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Moods Selection */}
              <FormField
                control={control}
                name="moods"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Moods</FormLabel>
                    <FormControl>
                      <MultipleSelector
                        defaultOptions={convertToMultipleSelectorOptions(relationOptions.moods)}
                        placeholder="Select moods"
                        value={
                          field.value
                            ? field.value.map((moodId) => {
                                const option = relationOptions.moods.find(
                                  (mood) => mood.value === moodId,
                                );
                                return option
                                  ? { value: option.value, label: option.label }
                                  : { value: moodId, label: moodId };
                              })
                            : []
                        }
                        onChange={(options: MultipleSelectorOption[]) => {
                          field.onChange(
                            options.map((option: MultipleSelectorOption) => option.value),
                          );
                        }}
                        badgeClassName="bg-accent/20 text-accent-foreground hover:bg-accent/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>

              <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
                {isSubmitting
                  ? isUpdateMode
                    ? 'Updating...'
                    : 'Uploading...'
                  : isUpdateMode
                  ? 'Update Meme'
                  : 'Upload Meme'}
              </Button>
            </div>
          </form>
        </Form>
      </ScrollArea>
    </DialogCustom>
  );
}

// Add the useDialog static method to make it compatible with DialogCustom pattern
ImageUploadDialog.useDialog = DialogCustom.useDialog;
