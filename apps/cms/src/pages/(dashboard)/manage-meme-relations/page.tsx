import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BoxesIcon, TagIcon, SmileIcon } from 'lucide-react';

import { ObjectsTabView } from './components/tabs/objects-tab';
import { TagsView } from './components/tabs/tags-tab';
import { MoodsTabView } from './components/tabs/moods-tab';
import { useMemeCollectionStore } from '@/stores/meme-store';
import { useRequest } from 'ahooks';
import { documentApi, GetDocumentsParams } from '@/services/document';
import { MemeMoodType, MemeObjectType, MemeTagType } from '@/types';
import { SmallLoading } from '@/components/custom/loading';
import { EMPTY_LIST } from '@/constants/common';

export type RelationType = 'objects' | 'tags' | 'moods';

export const Component = () => {
  const [activeTab, setActiveTab] = useState<RelationType>('tags');

  const tagCollectionId = useMemeCollectionStore((state) => state.tagCollection?.id);
  const objectCollectionId = useMemeCollectionStore((state) => state.objectCollection?.id);
  const moodCollectionId = useMemeCollectionStore((state) => state.moodCollection?.id);

  const {
    data: tagList,
    refresh: onRefreshTags,
    loading: isFetchingTags,
  } = useRequest(
    (params?: GetDocumentsParams) => {
      if (!tagCollectionId) return Promise.resolve(EMPTY_LIST);
      return documentApi.getDocuments<MemeTagType>(tagCollectionId, params);
    },
    {
      defaultParams: [{ limit: 1000 }],
      refreshDeps: [tagCollectionId],
    },
  );

  const {
    data: objectList,
    refresh: onRefreshObjects,
    loading: isFetchingObjects,
  } = useRequest(
    (params?: GetDocumentsParams) => {
      if (!objectCollectionId) return Promise.resolve(EMPTY_LIST);
      return documentApi.getDocuments<MemeObjectType>(objectCollectionId, params);
    },
    {
      defaultParams: [{ limit: 1000 }],
      refreshDeps: [objectCollectionId],
    },
  );

  const {
    data: moodList,
    refresh: onRefreshMoods,
    loading: isFetchingMoods,
  } = useRequest(
    (params?: GetDocumentsParams) => {
      if (!moodCollectionId) return Promise.resolve(EMPTY_LIST);
      return documentApi.getDocuments<MemeMoodType>(moodCollectionId, params);
    },
    {
      defaultParams: [{ limit: 1000 }],
      refreshDeps: [moodCollectionId],
    },
  );

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
          <TabsTrigger value="tags" className="!text-base py-3">
            <TagIcon className="mr-2 !h-6 !w-6" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="objects" className="!text-base py-3">
            <BoxesIcon className="mr-2 !h-6 !w-6" />
            Objects
          </TabsTrigger>
          <TabsTrigger value="moods" className="!text-base py-3">
            <SmileIcon className="mr-2 !h-6 !w-6" />
            Moods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tags">
          {isFetchingTags && <SmallLoading />}
          {!isFetchingTags && tagList && tagCollectionId && (
            <TagsView
              tagCollectionId={tagCollectionId}
              tags={tagList.documents}
              onRefresh={() => onRefreshTags()}
            />
          )}
        </TabsContent>

        <TabsContent value="objects" className="mt-4">
          {isFetchingObjects && <SmallLoading />}
          {!isFetchingObjects && objectList && objectCollectionId && (
            <ObjectsTabView
              objectCollectionId={objectCollectionId}
              objects={objectList.documents}
              onRefresh={() => onRefreshObjects()}
            />
          )}
        </TabsContent>

        <TabsContent value="moods">
          {isFetchingMoods && <SmallLoading />}
          {!isFetchingMoods && moodList && moodCollectionId && (
            <MoodsTabView
              moodCollectionId={moodCollectionId}
              moods={moodList.documents}
              onRefresh={() => onRefreshMoods()}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
