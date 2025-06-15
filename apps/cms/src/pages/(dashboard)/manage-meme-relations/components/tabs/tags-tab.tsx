import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DialogCustom } from '@/components/custom/dialog-custom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from '@/components/custom/form-field/input-text';
import { Badge } from '@/components/ui/badge';
import { memeTagSchema, MemeTagFormValues } from '@/validators';
import { FormDialog } from '@/components/custom/form-dialog';
import { SortBySelect, SortOption } from '@/components/custom/sort-by-select';

// Mock data for demonstrations
const mockTags = [
  {
    id: '1',
    label: 'funny',
    usageCount: 150,
    lastUsedAt: '2023-07-20T10:30:00Z',
    trendingScore: 95,
  },
  {
    id: '2',
    label: 'politics',
    usageCount: 120,
    lastUsedAt: '2023-07-18T14:20:00Z',
    trendingScore: 70,
  },
  {
    id: '3',
    label: 'technology',
    usageCount: 135,
    lastUsedAt: '2023-07-19T08:45:00Z',
    trendingScore: 85,
  },
  {
    id: '4',
    label: 'gaming',
    usageCount: 140,
    lastUsedAt: '2023-07-17T16:30:00Z',
    trendingScore: 90,
  },
  {
    id: '5',
    label: 'wholesome',
    usageCount: 110,
    lastUsedAt: '2023-07-15T11:20:00Z',
    trendingScore: 80,
  },
  {
    id: '6',
    label: 'relationship',
    usageCount: 80,
    lastUsedAt: '2023-07-10T09:45:00Z',
    trendingScore: 60,
  },
  {
    id: '7',
    label: 'school',
    usageCount: 70,
    lastUsedAt: '2023-07-05T13:20:00Z',
    trendingScore: 50,
  },
  {
    id: '8',
    label: 'movies',
    usageCount: 100,
    lastUsedAt: '2023-07-12T18:15:00Z',
    trendingScore: 75,
  },
];

type MemeTagType = {
  id: string;
  label: string;
  usageCount?: number;
  lastUsedAt?: string;
  trendingScore?: number;
};


// Trending score color categories
const getTrendingColor = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
};

export default function TagsTab() {
  const [tags, setTags] = useState<MemeTagType[]>(mockTags);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTag, setSelectedTag] = useState<MemeTagType | null>(null);
  const [sortOption, setSortOption] = useState<string>("");

  // Dialogs
  const addDialog = DialogCustom.useDialog();
  const editDialog = DialogCustom.useDialog();
  const deleteDialog = DialogCustom.useDialog();
  const form = useForm<MemeTagFormValues>({
    resolver: zodResolver(memeTagSchema),
    defaultValues: {
      label: '',
    },
  }); // Reset form when dialog opens/closes
  const resetForm = (tag?: MemeTagType) => {
    form.reset({
      id: tag?.id || '',
      label: tag?.label || '',
      // System-managed fields are not included in the form
    });
  };  // Define sort options for tags
  const sortOptions: SortOption[] = [
    { value: "trending", label: "Trending" },
    { value: "usage", label: "Most Used" },
    { value: "date", label: "Recently Used" },
  ];
  
  // Apply sorting and filtering
  const getSortedAndFilteredTags = () => {
    // First filter by search query
    const filtered = tags.filter((tag) =>
      tag.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Then apply sorting if a sort option is selected
    if (!sortOption) return filtered;
    
    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'trending':
          return (b.trendingScore || 0) - (a.trendingScore || 0);
        case 'usage':
          return (b.usageCount || 0) - (a.usageCount || 0);        case 'date': {
          // Parse dates and compare them
          const dateA = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
          const dateB = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
          return dateB - dateA;
        }
        default:
          return 0;
      }
    });
  };
  
  const filteredTags = getSortedAndFilteredTags();

  // Handle form submission
  const onSubmit = (values: MemeTagFormValues) => {
    if (isEditing && selectedTag) {
      // Update existing tag
      setTags(
        tags.map((tag) => (tag.id === selectedTag.id ? { ...values, id: selectedTag.id } : tag)),
      );
      editDialog.close();
    } else {
      // Add new tag
      const newTag = {
        ...values,
        id: Math.random().toString(36).substring(7), // Simple random ID for demo
      };
      setTags([...tags, newTag]);
      addDialog.close();
    }
    resetForm();
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedTag) {
      setTags(tags.filter((tag) => tag.id !== selectedTag.id));
      deleteDialog.close();
      setSelectedTag(null);
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

          <Button
            onClick={() => {
              setIsEditing(false);
              resetForm();
              addDialog.open();
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Tag
          </Button>
        </div>
      </CardHeader>      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-grow">
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
            <SortBySelect
            value={sortOption}
            onValueChange={setSortOption}
            options={sortOptions}
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
                    <h3 className="font-medium text-lg break-all">{tag.label}</h3>

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
                    onClick={() => {
                      setSelectedTag(tag);
                      setIsEditing(true);
                      resetForm(tag);
                      editDialog.open();
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setSelectedTag(tag);
                      deleteDialog.open();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>      {/* Add/Edit Dialog */}
      <FormDialog
        dialog={isEditing ? editDialog : addDialog}
        header={isEditing ? 'Edit Tag' : 'Add New Tag'}
        form={form}
        onSubmit={onSubmit}
        submitText={isEditing ? 'Save Changes' : 'Add Tag'}
        onClose={resetForm}
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
        onConfirmDelete={handleDelete}
        onCloseDelete={() => deleteDialog.close()}
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
