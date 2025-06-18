import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Grid2X2, Grid3X3, LayoutGrid, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StorageProviderSelector, StorageProvider } from '../storage-provider-selector';
import { Option as SelectOption } from '@/components/ui/multiple-selector';
import { DialogCustom } from '@/components/custom/dialog-custom';
import SearchBar from '@/components/custom/search-bar';
import { ImageUploadDialog } from '../image-upload-dialog';

import { MemeCard } from '../cards/appwrite-meme-card';
import { useMemeCollectionStore } from '@/stores/meme-store';
import memeApi from '@/services/meme';
import { getAppwriteImageUrl } from '@/lib/utils';
import { MemeDocument } from '@/types';
import { useDebounce, useRequest } from 'ahooks';
import { DEFAULT_MEMES_OFFSET, EMPTY_LIST } from '@/constants/common';
import { IMAGE_PLATFORM } from '@/enums';
import { GetDocumentsParams } from '@/services/document';

interface MemeWithImage extends MemeDocument {
  imageUrl?: string;
}

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
  const [selectedStorage, setSelectedStorage] = useState<StorageProvider>('appwrite');
  const [gridSize, setGridSize] = useState<GridSize>('3');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, { wait: 500 });

  const memeCollection = useMemeCollectionStore((state) => state.memeCollection);

  const uploadDialog = DialogCustom.useDialog();

  // Generate maps for relation lookups
  const tagMap: Record<string, string> = {};
  const objectMap: Record<string, string> = {};
  const moodMap: Record<string, string> = {};

  relationOptions.tags.forEach((tag) => {
    tagMap[tag.value] = tag.label;
  });

  relationOptions.objects.forEach((obj) => {
    objectMap[obj.value] = obj.label;
  });

  relationOptions.moods.forEach((mood) => {
    moodMap[mood.value] = mood.label;
  });

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

  // Handle edit meme
  const handleEditMeme = (memeId: string) => {
    console.log('Edit meme:', memeId);
    // TODO: Implement edit functionality
  };

  const {
    data: data,
    run,
    refresh,
    loading,
    error,
  } = useRequest(
    (params: GetDocumentsParams) => {
      if (!memeCollection) return Promise.resolve(EMPTY_LIST);

      return memeApi.getMemes(memeCollection.id, params).then((res) => ({
        total: res.total,
        documents: res.documents.map((doc) => {
          // Construct image URL based on saved platform
          if (doc.saved_platform === 'appwrite' && doc.fileId) {
            return {
              ...doc,
              imageUrl: getAppwriteImageUrl(doc.fileId, 'view', {
                height: 400,
                quality: 80,
              }),
            } as MemeWithImage;
          }
          return doc as MemeWithImage;
        }),
      }));
    },
    {
      defaultParams: [
        {
          limit: DEFAULT_MEMES_OFFSET,
          offset: 0,
          queries: [`saved_platform,equal,${IMAGE_PLATFORM.APPWRITE}`],
        },
      ],
      refreshDeps: [memeCollection],
    },
  );

  const handleRefresh = () => {
    onRefreshRelations();
    refresh();
  };

  useEffect(() => {
    if (memeCollection) {
      if (debouncedSearchTerm.trim() === '') {
        run({
          limit: DEFAULT_MEMES_OFFSET,
          offset: 0,
          queries: [
            `saved_platform,equal,${IMAGE_PLATFORM.APPWRITE}`,
          ],
        });
        return;
      }

      run({
        limit: DEFAULT_MEMES_OFFSET,
        offset: 0,
        queries: [
          `saved_platform,equal,${IMAGE_PLATFORM.APPWRITE}`,
          `title_en,search,${debouncedSearchTerm}`,
          `title_vi,search,${debouncedSearchTerm}`,
          `desc_en,search,${debouncedSearchTerm}`,
          `desc_vi,search,${debouncedSearchTerm}`,
          `desc_en,search,${debouncedSearchTerm}`,
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="!text-2xl">Meme Images</CardTitle>
              <CardDescription>
                Upload, browse and manage your meme image collection
              </CardDescription>
            </div>

            <Button className="w-full md:w-auto" onClick={() => uploadDialog.open()}>
              <Upload className="mr-2 h-4 w-4" /> Upload Image
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
              <StorageProviderSelector
                selectedStorage={selectedStorage}
                onSelect={setSelectedStorage}
              />

              <SearchBar
                placeholder="Search memes..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-full sm:w-64"
              />
            </div>

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

          {loading && (
            <div className="min-h-[200px] w-full flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="sr-only">Loading memes...</span>
            </div>
          )}
          {error && (
            <div className="min-h-[200px] w-full flex flex-col justify-center items-center gap-4 text-muted-foreground">
              <Button variant="outline" onClick={refresh}>
                Retry
              </Button>
            </div>
          )}
          {!loading && data && (
            <div className={`grid ${getGridSizeClass()} gap-4`}>
              {data.documents.length > 0 ? (
                data.documents.map((meme) => (
                  <MemeCard
                    key={meme.id}
                    meme={meme}
                    tagNames={tagMap}
                    objectNames={objectMap}
                    moodNames={moodMap}
                    onEdit={handleEditMeme}
                  />
                ))
              ) : (
                <div className="col-span-full min-h-[200px] flex flex-col justify-center items-center gap-4 text-muted-foreground">
                  <p>{searchTerm ? 'No memes found matching your search.' : 'No memes found.'}</p>
                  <Button onClick={() => uploadDialog.open()}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Your First Meme
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        dialog={uploadDialog}
        relationOptions={relationOptions}
        onSuccess={handleRefresh}
      />
    </>
  );
}
