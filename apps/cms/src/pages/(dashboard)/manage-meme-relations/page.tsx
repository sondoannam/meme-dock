import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BoxesIcon, TagIcon, SmileIcon } from 'lucide-react';

import ObjectsTab from './components/tabs/objects-tab';
import { TagsView } from './components/tabs/tags-tab';
import MoodsTab from './components/tabs/moods-tab';
import { useMemeCollectionStore } from '@/stores/meme-store';
import { useRequest } from 'ahooks';
import { documentApi, GetDocumentsParams } from '@/services/document';
import { MemeTagType } from '@/types';
import { SmallLoading } from '@/components/custom/loading';

export type RelationType = 'objects' | 'tags' | 'moods';

export const Component = () => {
  const [activeTab, setActiveTab] = useState<RelationType>('objects');

  const tagCollectionId = useMemeCollectionStore((state) => state.tagCollection?.slug);

  const {
    data: tags,
    run: onRefreshTags,
    loading: isFetchingTags,
  } = useRequest((params: GetDocumentsParams = {}) => {
    if (!tagCollectionId) return Promise.resolve([]);
    return documentApi.getDocuments<MemeTagType[]>(tagCollectionId, params);
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="!text-3xl font-bold mb-6">
        <span className="text-brand-yellow-2 !text-3xl">Meme</span> Relations
      </h1>

      <Tabs
        defaultValue="objects"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as RelationType)}
        className="w-full"
      >
        <TabsList className="!h-auto grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="objects" className="!text-base py-3">
            <BoxesIcon className="mr-2 !h-6 !w-6" />
            Objects
          </TabsTrigger>
          <TabsTrigger value="tags" className="!text-base py-3">
            <TagIcon className="mr-2 !h-6 !w-6" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="moods" className="!text-base py-3">
            <SmileIcon className="mr-2 !h-6 !w-6" />
            Moods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="objects" className="mt-4">
          <ObjectsTab />
        </TabsContent>

        <TabsContent value="tags">
          {isFetchingTags && <SmallLoading />}
          {(!isFetchingTags && tags && tagCollectionId) && (
            <TagsView tagCollectionId={tagCollectionId} tags={tags} onRefresh={onRefreshTags} />
          )}
        </TabsContent>

        <TabsContent value="moods">
          <MoodsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
