import { useMemeCollectionStore } from '@/stores/meme-store';
import MemesGalleryTabs from './components/memes-gallery-tabs';
import { useRequest } from 'ahooks';
import { documentApi } from '@/services/document';
import { MemeObjectType, MemeTagType } from '@/types';
import { Option as SelectOption } from '@/components/ui/multiple-selector';
import { SmallLoading } from '@/components/custom/loading';

export const Component = () => {
  const tagCollectionId = useMemeCollectionStore((state) => state.tagCollection?.id);
  const objectCollectionId = useMemeCollectionStore((state) => state.objectCollection?.id);
  const moodCollectionId = useMemeCollectionStore((state) => state.moodCollection?.id);

  const {
    data: relationOptions,
    run: onRefreshRelations,
    loading: isFetchingRelations,
  } = useRequest(
    () => {
      if (!tagCollectionId || !objectCollectionId || !moodCollectionId) {
        return Promise.resolve({
          tags: [],
          objects: [],
          moods: [],
        });
      }

      const tagPromise = documentApi
        .getDocuments<MemeTagType>(tagCollectionId, { limit: 1000 })
        .then((res) => {
          return res.documents.map((tag) => ({
            label: `#${tag.label}`,
            value: tag.id,
          })) as SelectOption[];
        });

      const objectPromise = documentApi
        .getDocuments<MemeObjectType>(objectCollectionId, { limit: 1000 })
        .then((res) => {
          return res.documents.map((object) => ({
            label: `${object.label_en}-(${object.label_vi})`,
            value: object.id,
          })) as SelectOption[];
        });

      const moodPromise = documentApi
        .getDocuments<MemeObjectType>(moodCollectionId, { limit: 1000 })
        .then((res) => {
          return res.documents.map((mood) => ({
            label: `${mood.label_en}-(${mood.label_vi})`,
            value: mood.id,
          })) as SelectOption[];
        });

      return Promise.all([tagPromise, objectPromise, moodPromise]).then(
        ([tags, objects, moods]) => ({
          tags,
          objects,
          moods,
        }),
      );
    },
    {
      refreshDeps: [tagCollectionId, objectCollectionId, moodCollectionId],
    },
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="!text-3xl font-bold mb-6">
        <span className="text-brand-yellow-2 !text-3xl">Memes</span> Gallery
      </h1>
      {isFetchingRelations && <SmallLoading />}
      {relationOptions && !isFetchingRelations && (
        <MemesGalleryTabs
          relationOptions={relationOptions}
          onRefreshRelations={onRefreshRelations}
        />
      )}
    </div>
  );
};
