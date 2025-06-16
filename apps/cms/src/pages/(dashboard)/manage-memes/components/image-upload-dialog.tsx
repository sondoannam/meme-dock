import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FileUploader, FileUploaderContent, FileInput } from '@/components/ui/file-upload-dropzone';
import MultipleSelector, { Option as SelectOption } from '@/components/ui/multiple-selector';

import { InputText } from '@/components/custom/form-field/input-text';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { DialogCustom } from '@/components/custom/dialog-custom';
import { DialogInstance } from '@/components/custom/dialog-custom/use-dialog';
import { ImageUploadFormValues, imageUploadSchema } from '@/validators';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ImageUploadDialogProps {
  dialog: DialogInstance;
  relationOptions: {
    tags: SelectOption[];
    objects: SelectOption[];
    moods: SelectOption[];
  };
  onSuccess: () => void;
}

export function ImageUploadDialog({ dialog, relationOptions, onSuccess }: ImageUploadDialogProps) {
  const dialogInstance = DialogCustom.useDialog(dialog);
  const [files, setFiles] = useState<File[] | null>(null);
    console.log('relationOptions', relationOptions.tags);
  const form = useForm<ImageUploadFormValues>({
    resolver: zodResolver(imageUploadSchema) as any,
    defaultValues: {
      title_en: '',
      title_vi: '',
      description: '',
      tags: [],
      objects: [],
      moods: [],
      imageFile: [],
    },
  });

  const {
    control,
    formState: { isSubmitting, errors },
    handleSubmit,
    setValue,
  } = form;

  const onSubmit = async (data: ImageUploadFormValues) => {
    try {
      // Mock API call - would be replaced with actual API
      console.log('Form data submitted:', data);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Image uploaded successfully!');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleClose = () => {
    form.reset();
    setFiles(null);
    dialogInstance.close();
  };

  return (
    <DialogCustom
      dialog={dialog}
      header={
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Upload New Meme Image</h2>
          <p className="text-sm text-muted-foreground">
            Add a new meme image to your collection with tags, objects and moods.
          </p>
        </div>
      }
      className="!max-w-[800px] w-full"
    >
      <ScrollArea className="h-[70vh] pr-2.5 w-full">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-1">
            {/* Image Dropzone */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Image</h3>
              <FileUploader
                value={files}
                onValueChange={(newFiles) => {
                  setFiles(newFiles);
                  if (newFiles && newFiles.length > 0) {
                    setValue('imageFile', newFiles, { shouldValidate: true });
                  } else {
                    setValue('imageFile', [], { shouldValidate: true });
                  }
                }}
                dropzoneOptions={{
                  accept: {
                    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                  },
                  maxFiles: 1,
                  maxSize: 5 * 1024 * 1024, // 5MB
                  multiple: false,
                }}
              >
                <FileUploaderContent>
                  <FileInput className="h-[200px] cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-md hover:bg-accent/50 transition-colors">
                    {files && files.length > 0 ? (
                      <div className="relative w-full h-full">
                        <img
                          src={URL.createObjectURL(files[0])}
                          alt="Preview"
                          className="object-contain w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-5">
                        <svg
                          className="h-10 w-10 text-muted-foreground mb-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
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
                        defaultOptions={relationOptions.tags}
                        placeholder="Select tags"
                        value={
                          field.value
                            ? field.value.map((tagId) => {
                                const option = relationOptions.tags.find(
                                  (tag) => tag.value === tagId,
                                );
                                return option || { value: tagId, label: tagId };
                              })
                            : []
                        }
                        onChange={(options) => {
                          field.onChange(options.map((option) => option.value));
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
                        defaultOptions={relationOptions.objects}
                        placeholder="Select objects"
                        value={
                          field.value
                            ? field.value.map((objectId) => {
                                const option = relationOptions.objects.find(
                                  (obj) => obj.value === objectId,
                                );
                                return option || { value: objectId, label: objectId };
                              })
                            : []
                        }
                        onChange={(options) => {
                          field.onChange(options.map((option) => option.value));
                        }}
                        badgeClassName="bg-secondary/10 text-secondary hover:bg-secondary/20"
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
                        defaultOptions={relationOptions.moods}
                        placeholder="Select moods"
                        value={
                          field.value
                            ? field.value.map((moodId) => {
                                const option = relationOptions.moods.find(
                                  (mood) => mood.value === moodId,
                                );
                                return option || { value: moodId, label: moodId };
                              })
                            : []
                        }
                        onChange={(options) => {
                          field.onChange(options.map((option) => option.value));
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
                {isSubmitting ? 'Uploading...' : 'Upload Image'}
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
