import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Grid2X2, Grid3X3, LayoutGrid } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StorageProviderSelector, StorageProvider } from '../storage-provider-selector';
import { mockImages } from '../mock-data';
import { Option as SelectOption } from '@/components/ui/multiple-selector';
import { ImageUploadDialog } from '../image-upload-dialog';
import { DialogCustom } from '@/components/custom/dialog-custom';

type GridSize = '2' | '3' | '4' | '6';

interface ImagesTabProps {
  relationOptions: {
    tags: SelectOption[];
    objects: SelectOption[];
    moods: SelectOption[];
  };
  onRefreshRelations: () => void;
}

export default function ImagesTab({ relationOptions, onRefreshRelations }: ImagesTabProps) {
  const [selectedStorage, setSelectedStorage] = useState<StorageProvider>('all');
  const [gridSize, setGridSize] = useState<GridSize>('3');
  const uploadDialog = DialogCustom.useDialog();

  const getGridSizeClass = (): string => {
    switch (gridSize) {
      case '2':
        return 'grid-cols-1 md:grid-cols-2';
      case '3':
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case '4':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
      case '6':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="!text-2xl">Meme Images</CardTitle>
              <CardDescription>Upload, browse and manage your meme image collection</CardDescription>
            </div>

            <Button 
              className="w-full md:w-auto" 
              onClick={() => uploadDialog.open()}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Image
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <StorageProviderSelector
              selectedStorage={selectedStorage}
              onSelect={setSelectedStorage}
            />

            <Select value={gridSize} onValueChange={(value) => setGridSize(value as GridSize)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Grid Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">
                  <div className="flex items-center">
                    <Grid2X2 className="h-4 w-4 mr-2" />
                    <span>2 Columns</span>
                  </div>
                </SelectItem>
                <SelectItem value="3">
                  <div className="flex items-center">
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    <span>3 Columns</span>
                  </div>
                </SelectItem>
                <SelectItem value="4">
                  <div className="flex items-center">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    <span>4 Columns</span>
                  </div>
                </SelectItem>
                <SelectItem value="6">
                  <div className="flex items-center">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    <span>6 Columns</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={`grid ${getGridSizeClass()} gap-4`}>
            {mockImages.map((image) => (
              <Card
                key={image.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardFooter className="p-2">
                  <p className="text-sm truncate">{image.title}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Image Upload Dialog */}
      <ImageUploadDialog 
        dialog={uploadDialog} 
        relationOptions={relationOptions} 
        onSuccess={() => onRefreshRelations()} 
      />
    </>
  );
}
