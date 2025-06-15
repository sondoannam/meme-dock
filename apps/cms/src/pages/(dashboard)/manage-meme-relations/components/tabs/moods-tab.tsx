import { useState } from 'react';
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
import { DialogCustom } from '@/components/custom/dialog-custom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { InputText } from '@/components/custom/form-field/input-text';

import { memeMoodSchema, MemeMoodFormValues } from '@/validators';
import { Slider } from '@/components/ui/slider';
import { FormDialog } from '@/components/custom/form-dialog';

// Mock data for demonstrations
const mockMoods = [
  { 
    id: '1', 
    label_en: 'Happy', 
    label_vi: 'Vui vẻ',
    slug: 'happy',
    intensity: 7,
    usageCount: 120,
    lastUsedAt: '2023-07-20T14:30:00Z',
    trendingScore: 85
  },
  { 
    id: '2', 
    label_en: 'Sad', 
    label_vi: 'Buồn',
    slug: 'sad',
    intensity: 5,
    usageCount: 95,
    lastUsedAt: '2023-07-18T09:15:00Z',
    trendingScore: 70
  },
  {
    id: '3',
    label_en: 'Angry',
    label_vi: 'Giận dữ',
    slug: 'angry',
    intensity: 9,
    usageCount: 110,
    lastUsedAt: '2023-07-19T16:45:00Z',
    trendingScore: 90
  },
  { 
    id: '4', 
    label_en: 'Surprised', 
    label_vi: 'Ngạc nhiên',
    slug: 'surprised',
    intensity: 8,
    usageCount: 80,
    lastUsedAt: '2023-07-15T11:20:00Z',
    trendingScore: 65
  },
  {
    id: '5',
    label_en: 'Confused',
    label_vi: 'Bối rối',
    slug: 'confused',
    intensity: 6,
    usageCount: 75,
    lastUsedAt: '2023-07-10T08:50:00Z',
    trendingScore: 60
  },
];

type MemeMoodType = {
  id: string;
  label_en: string;
  label_vi: string;
  slug: string;
  intensity?: number;
  // System-managed fields (display only)
  usageCount?: number;
  lastUsedAt?: string;
  trendingScore?: number;
};

export default function MoodsTab() {
  const [moods, setMoods] = useState<MemeMoodType[]>(mockMoods);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MemeMoodType | null>(null);

  // Dialogs
  const addDialog = DialogCustom.useDialog();
  const editDialog = DialogCustom.useDialog();
  const deleteDialog = DialogCustom.useDialog();const form = useForm<MemeMoodFormValues>({
    resolver: zodResolver(memeMoodSchema),
    defaultValues: {
      label_en: '',
      label_vi: '',
      slug: '',
      intensity: 5 as unknown as number, // Default mid-range intensity
    },
  });  // Reset form when dialog opens/closes
  const resetForm = (mood?: MemeMoodType) => {
    form.reset({
      id: mood?.id || '',
      label_en: mood?.label_en || '',
      label_vi: mood?.label_vi || '',
      slug: mood?.slug || '',
      intensity: mood?.intensity ? Number(mood.intensity) : 5,
      // System-managed fields are not included in the form
    });
  };  // Filter moods based on search query
  const filteredMoods = moods.filter(
    (mood) =>
      mood.label_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mood.label_vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mood.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle form submission
  const onSubmit = (values: MemeMoodFormValues) => {
    if (isEditing && selectedMood) {
      // Update existing mood
      setMoods(
        moods.map((mood) =>
          mood.id === selectedMood.id ? { ...values, id: selectedMood.id } : mood,
        ),
      );
      editDialog.close();
    } else {
      // Add new mood
      const newMood = {
        ...values,
        id: Math.random().toString(36).substring(7), // Simple random ID for demo
      };
      setMoods([...moods, newMood]);
      addDialog.close();
    }
    resetForm();
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedMood) {
      setMoods(moods.filter((mood) => mood.id !== selectedMood.id));
      deleteDialog.close();
      setSelectedMood(null);
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    if (intensity <= 6)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="!text-2xl">Meme Moods</CardTitle>
            <CardDescription>Add, edit and manage moods that express meme emotions</CardDescription>
          </div>

          <Button
            onClick={() => {
              setIsEditing(false);
              resetForm();
              addDialog.open();
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Mood
          </Button>
        </div>
      </CardHeader>      <CardContent>        <div className="mb-6">
          <Input
            placeholder="Search moods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {filteredMoods.length === 0 ? (
          <div className="text-center p-8 border rounded-md">
            <p className="text-muted-foreground">
              No moods found. Add your first mood to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMoods.map((mood) => (              <Card key={mood.id} className="overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardTitle>{mood.label_en}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Vietnamese:</span>
                    <span className="ml-2">{mood.label_vi}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Slug:</span>
                    <span className="ml-2 text-muted-foreground">{mood.slug}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Intensity:</span>
                    <span
                      className={`text-xs font-medium py-1 px-2 rounded-full ${getIntensityColor(
                        mood.intensity || 0,
                      )}`}
                    >
                      {mood.intensity}/10
                    </span>
                  </div>
                  {mood.usageCount !== undefined && (
                    <div>
                      <span className="text-sm font-medium">Usage Count:</span>
                      <span className="ml-2 text-muted-foreground">{mood.usageCount}</span>
                    </div>
                  )}
                  {mood.trendingScore !== undefined && (
                    <div>
                      <span className="text-sm font-medium">Trending Score:</span>
                      <span className="ml-2 text-muted-foreground">{mood.trendingScore}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedMood(mood);
                      setIsEditing(true);
                      resetForm(mood);
                      editDialog.open();
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setSelectedMood(mood);
                      deleteDialog.open();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>      {/* Add/Edit Dialog */}
      <FormDialog
        dialog={isEditing ? editDialog : addDialog}
        header={isEditing ? 'Edit Mood' : 'Add New Mood'}
        form={form}
        onSubmit={onSubmit}
        submitText={isEditing ? 'Save Changes' : 'Add Mood'}
        onClose={resetForm}
        className="max-w-md"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputText
            control={form.control}
            name="label_en"
            label="English Label"
            placeholder="e.g. Happy, Sad, Angry"
          />
          <InputText
            control={form.control}
            name="label_vi"
            label="Vietnamese Label"
            placeholder="e.g. Vui vẻ, Buồn, Giận dữ"
          />
        </div>
        <InputText
          control={form.control}
          name="slug"
          label="Slug"
          placeholder="e.g. happy, sad, angry"
        />
        <FormField
          control={form.control}
          name="intensity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intensity (1-10)</FormLabel>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
                <FormControl>
                  <Slider
                    defaultValue={[typeof field.value === 'number' ? field.value : 5]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(values) => field.onChange(values[0])}
                  />
                </FormControl>
                <div className="text-center font-medium">{field.value || 5}</div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* System-managed fields are not included in the form as they are not user-editable */}
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <DialogCustom
        dialog={deleteDialog}
        isConfirmDelete={true}
        header="Delete Mood"
        onConfirmDelete={handleDelete}
        onCloseDelete={() => deleteDialog.close()}
      >        <p>
          Are you sure you want to delete <strong>{selectedMood?.label_en}</strong>?
        </p>
        <p className="text-muted-foreground mt-2">
          This action cannot be undone. This will permanently delete the mood and any relationships.
        </p>
      </DialogCustom>
    </Card>
  );
}
