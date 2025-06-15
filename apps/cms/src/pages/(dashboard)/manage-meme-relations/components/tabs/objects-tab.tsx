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
import { InputText } from '@/components/custom/form-field/input-text';

import { memeObjectSchema, MemeObjectFormValues } from '@/validators';
import { FormDialog } from '@/components/custom/form-dialog';

// Mock data for demonstrations
const mockObjects = [
  { 
    id: '1', 
    label_en: 'Person', 
    label_vi: 'Người', 
    slug: 'person',
    usageCount: 245,
    lastUsedAt: '2023-07-22T15:30:00Z',
    trendingScore: 92
  },
  { 
    id: '2', 
    label_en: 'Animal', 
    label_vi: 'Động vật', 
    slug: 'animal',
    usageCount: 180,
    lastUsedAt: '2023-07-21T12:45:00Z',
    trendingScore: 85
  },
  { 
    id: '3', 
    label_en: 'Food', 
    label_vi: 'Đồ ăn', 
    slug: 'food',
    usageCount: 120,
    lastUsedAt: '2023-07-18T09:30:00Z',
    trendingScore: 70
  },
  { 
    id: '4', 
    label_en: 'Vehicle', 
    label_vi: 'Phương tiện', 
    slug: 'vehicle',
    usageCount: 95,
    lastUsedAt: '2023-07-15T17:20:00Z',
    trendingScore: 65
  },
  { 
    id: '5', 
    label_en: 'Building', 
    label_vi: 'Tòa nhà', 
    slug: 'building',
    usageCount: 80,
    lastUsedAt: '2023-07-10T11:45:00Z',
    trendingScore: 55
  },
];

type MemeObjectType = {
  id: string;
  label_en: string;
  label_vi: string;
  slug: string;
  // System-managed fields (display only)
  usageCount?: number;
  lastUsedAt?: string;
  trendingScore?: number;
};

export default function ObjectsTab() {
  const [objects, setObjects] = useState<MemeObjectType[]>(mockObjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedObject, setSelectedObject] = useState<MemeObjectType | null>(null);

  // Dialogs
  const addDialog = DialogCustom.useDialog();
  const editDialog = DialogCustom.useDialog();
  const deleteDialog = DialogCustom.useDialog();const form = useForm<MemeObjectFormValues>({
    resolver: zodResolver(memeObjectSchema),
    defaultValues: {
      label_en: '',
      label_vi: '',
      slug: '',
    },
  });  // Reset form when dialog opens/closes
  const resetForm = (object?: MemeObjectType) => {
    form.reset({
      id: object?.id || '',
      label_en: object?.label_en || '',
      label_vi: object?.label_vi || '',
      slug: object?.slug || '',
      // System-managed fields are not included in the form
    });
  };  // Filter objects based on search query
  const filteredObjects = objects.filter(
    (object) =>
      object.label_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      object.label_vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      object.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle form submission
  const onSubmit = (values: MemeObjectFormValues) => {
    if (isEditing && selectedObject) {
      // Update existing object
      setObjects(
        objects.map((obj) =>
          obj.id === selectedObject.id ? { ...values, id: selectedObject.id } : obj,
        ),
      );
      editDialog.close();
    } else {
      // Add new object
      const newObject = {
        ...values,
        id: Math.random().toString(36).substring(7), // Simple random ID for demo
      };
      setObjects([...objects, newObject]);
      addDialog.close();
    }
    resetForm();
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedObject) {
      setObjects(objects.filter((obj) => obj.id !== selectedObject.id));
      deleteDialog.close();
      setSelectedObject(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="!text-2xl">Meme Objects</CardTitle>
            <CardDescription>Add, edit and manage objects that appear in memes</CardDescription>
          </div>

          <Button
            onClick={() => {
              setIsEditing(false);
              resetForm();
              addDialog.open();
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Object
          </Button>
        </div>
      </CardHeader>      <CardContent>        <div className="mb-6">
          <Input
            placeholder="Search objects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {filteredObjects.length === 0 ? (
          <div className="text-center p-8 border rounded-md">
            <p className="text-muted-foreground">
              No objects found. Add your first object to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredObjects.map((object) => (              <Card key={object.id} className="overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardTitle>{object.label_en}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Vietnamese:</span>
                    <span className="ml-2">{object.label_vi}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Slug:</span>
                    <span className="ml-2 text-muted-foreground">{object.slug}</span>
                  </div>
                  {object.usageCount !== undefined && (
                    <div>
                      <span className="text-sm font-medium">Usage Count:</span>
                      <span className="ml-2 text-muted-foreground">{object.usageCount}</span>
                    </div>
                  )}
                  {object.trendingScore !== undefined && (
                    <div>
                      <span className="text-sm font-medium">Trending Score:</span>
                      <span className="ml-2 text-muted-foreground">{object.trendingScore}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedObject(object);
                      setIsEditing(true);
                      resetForm(object);
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
                      setSelectedObject(object);
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
        header={isEditing ? 'Edit Object' : 'Add New Object'}
        form={form}
        onSubmit={onSubmit}
        submitText={isEditing ? 'Save Changes' : 'Add Object'}
        onClose={resetForm}
        className="max-w-md"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputText
            control={form.control}
            name="label_en"
            label="English Label"
            placeholder="e.g. Person, Animal, Food"
          />
          <InputText
            control={form.control}
            name="label_vi"
            label="Vietnamese Label"
            placeholder="e.g. Người, Động vật, Đồ ăn"
          />
        </div>
        <InputText
          control={form.control}
          name="slug"
          label="Slug"
          placeholder="e.g. person, animal, food"
        />
        {/* System-managed fields are not included in the form as they are not user-editable */}
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <DialogCustom
        dialog={deleteDialog}
        isConfirmDelete={true}
        header="Delete Object"
        onConfirmDelete={handleDelete}
        onCloseDelete={() => deleteDialog.close()}
      >        <p>
          Are you sure you want to delete <strong>{selectedObject?.label_en}</strong>?
        </p>
        <p className="text-muted-foreground mt-2">
          This action cannot be undone. This will permanently delete the object and any
          relationships.
        </p>
      </DialogCustom>
    </Card>
  );
}
