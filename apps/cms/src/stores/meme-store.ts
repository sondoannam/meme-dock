import { CollectionSchemaType } from '@/validators';
import { create } from 'zustand';

type MemeCollectionState = {
  memeCollection: CollectionSchemaType | null;
  objectCollection: CollectionSchemaType | null;
  tagCollection: CollectionSchemaType | null;
  moodCollection: CollectionSchemaType | null;
};

type MemeCollectionAction = {
  setMemeCollection: (collection: CollectionSchemaType | null) => void;
  setObjectCollection: (collection: CollectionSchemaType | null) => void;
  setTagCollection: (collection: CollectionSchemaType | null) => void;
  setMoodCollection: (collection: CollectionSchemaType | null) => void;
};

export const useMemeCollectionStore = create<MemeCollectionState & MemeCollectionAction>((set) => ({
  memeCollection: null,
  objectCollection: null,
  tagCollection: null,
  moodCollection: null,
  setMemeCollection: (collection) =>
    set(() => ({
      memeCollection: collection,
    })),
  setObjectCollection: (collection) =>
    set(() => ({
      objectCollection: collection,
    })),
  setTagCollection: (collection) =>
    set(() => ({
      tagCollection: collection,
    })),
  setMoodCollection: (collection) =>
    set(() => ({
      moodCollection: collection,
    })),
}));
