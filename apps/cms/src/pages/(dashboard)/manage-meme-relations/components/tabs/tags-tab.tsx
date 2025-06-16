import { useMemo, useState } from 'react';
import { useDebounce, useRequest } from 'ahooks';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogCustom } from '@/components/custom/dialog-custom';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from '@/components/custom/form-field/input-text';
import { Badge } from '@/components/ui/badge';
import { BasicSelect, SelectOption } from '@/components/custom/basic-select';
import { FormDialog } from '@/components/custom/form-dialog';
import { memeTagSchema, MemeTagFormValues } from '@/validators';
import { documentApi, GetDocumentsParams } from '@/services/document';
import { MemeTagType } from '@/types';

// Trending score color categories
const getTrendingColor = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
};

const sortOptions: SelectOption[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'usage', label: 'Most Used' },
  { value: 'date', label: 'Recently Used' },
  { value: 'label', label: 'Alphabetical' },
];

interface TagsViewProps {
  tagCollectionId: string;
  tags: MemeTagType[];
  onRefresh: (params?: GetDocumentsParams) => void;
}

export function TagsView({ tagCollectionId, tags, onRefresh }: TagsViewProps) {
  const [selectedTag, setSelectedTag] = useState<MemeTagType | null>(null);
  const [sortOption, setSortOption] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, { wait: 500 });

  const cuDialog = DialogCustom.useDialog();
  const deleteDialog = DialogCustom.useDialog();

  const handleOpenCreate = () => {
    setSelectedTag(null);
    cuDialog.open();
  };

  const handleOpenUpdate = (tag: MemeTagType) => {
    setSelectedTag(tag);
    cuDialog.open();
  };

  const handleOpenDelete = (tag: MemeTagType) => {
    setSelectedTag(tag);
    deleteDialog.open();
  };

  const closeCUDialog = () => {
    cuDialog.close();
    setSelectedTag(null);
  };

  const closeDeleteDialog = () => {
    deleteDialog.close();
    setSelectedTag(null);
  };

  const createOrUpdateMeme = async (data: MemeTagFormValues) => {
    const defaultPayload: Partial<MemeTagType> = {
      usageCount: 0,
      trendingScore: 0.0,
      ...data,
    }

    if (selectedTag) {
      return documentApi.updateDocument<MemeTagType>(tagCollectionId, selectedTag.id, defaultPayload);
    }

    return documentApi.createDocument<MemeTagType>(tagCollectionId, defaultPayload);
  };

  const { run: deleteMeme, loading: isDeleting } = useRequest(
    () => {
      if (!selectedTag || !selectedTag.id) {
        return Promise.reject(new Error('No tag selected for deletion'));
      }
      return documentApi.deleteDocument(tagCollectionId, selectedTag.id);
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success('Tag deleted successfully!');
        onRefresh();
        closeDeleteDialog();
      },
      onError: (error: any) => {
        console.error('Error deleting tag:', error);
        toast.error(`Failed to delete tag: ${error.message || 'Unknown error'}`);
      },
    },
  );

  const form = useForm<MemeTagFormValues>({
    resolver: zodResolver(memeTagSchema),
    defaultValues: {
      label: selectedTag ? selectedTag.label : '',
    },
  });

  // Apply sorting and filtering
  const filteredTags = useMemo(() => {
    if (!tags || tags.length === 0) return [];
    // First filter by search query
    const filtered = tags.filter((tag) =>
      tag.label.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
    );

    // Then apply sorting if a sort option is selected
    if (!sortOption) return filtered;

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'trending':
          return (b.trendingScore || 0) - (a.trendingScore || 0);
        case 'usage':
          return (b.usageCount || 0) - (a.usageCount || 0);
        case 'date': {
          // Parse dates and compare them
          const dateA = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
          const dateB = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
          return dateB - dateA;
        }
        case 'label':
          return a.label.localeCompare(b.label);
        default:
          return 0;
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, sortOption]);

  // Handle form submission
  const onSubmit = async (values: MemeTagFormValues) => {
    try {
      await createOrUpdateMeme(values);

      toast.success(`Tag ${selectedTag ? 'updated' : 'created'} successfully!`);
      onRefresh();
      cuDialog.close();
      form.reset();
    } catch (error: any) {
      console.error('Error saving tag:', error);
      toast.error(`Failed to save tag: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="!text-2xl">Meme Tags</CardTitle>
            <CardDescription>Add, edit and manage tags that describe memes</CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Tag
          </Button>
        </div>
      </CardHeader>{' '}
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-grow">
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          <BasicSelect
            placeholder="Sort by..."
            value={sortOption}
            onValueChange={setSortOption}
            options={sortOptions}
            enableReset
            className='w-[180px]'
          />
        </div>

        {filteredTags.length === 0 ? (
          <div className="text-center p-8 border rounded-md">
            <p className="text-muted-foreground">
              No tags found. Add your first tag to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="relative group border rounded-lg p-4 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-lg break-all">#{tag.label}</h3>

                  <div className="flex flex-wrap gap-2 mt-1">
                    {tag.usageCount !== undefined && (
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                      >
                        Used: {tag.usageCount}
                      </Badge>
                    )}
                    {tag.trendingScore !== undefined && (
                      <Badge variant="outline" className={`${getTrendingColor(tag.trendingScore)}`}>
                        Trending: {tag.trendingScore}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleOpenUpdate(tag)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleOpenDelete(tag)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>{' '}
      {/* Add/Edit Dialog */}
      <FormDialog
        dialog={cuDialog}
        header={selectedTag ? 'Edit Tag' : 'Add New Tag'}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={form.formState.isSubmitting}
        submitText={selectedTag ? 'Save Changes' : 'Add Tag'}
        onClose={closeCUDialog}
        className="max-w-md"
      >
        <InputText
          control={form.control}
          name="label"
          label="Label"
          placeholder="e.g. funny, politics, gaming"
        />
        {/* System-managed fields are not included in the form as they are not user-editable */}
      </FormDialog>
      {/* Delete Confirmation Dialog */}
      <DialogCustom
        dialog={deleteDialog}
        isConfirmDelete={true}
        header="Delete Tag"
        onConfirmDelete={deleteMeme}
        onCloseDelete={() => deleteDialog.close()}
        deleteLoading={isDeleting}
      >
        <p>
          Are you sure you want to delete <strong>{selectedTag?.label}</strong>?
        </p>
        <p className="text-muted-foreground mt-2">
          This action cannot be undone. This will permanently delete the tag and any relationships.
        </p>
      </DialogCustom>
    </Card>
  );
}
