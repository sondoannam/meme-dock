import { Collection } from '@/types';
import { create } from 'zustand';

type MemeCollectionState = {
  memeCollection: Collection | null;
  objectCollection: Collection | null;
  tagCollection: Collection | null;
  moodCollection: Collection | null;
};

type MemeCollectionAction = {
  setMemeCollection: (collection: Collection | null) => void;
  setObjectCollection: (collection: Collection | null) => void;
  setTagCollection: (collection: Collection | null) => void;
  setMoodCollection: (collection: Collection | null) => void;
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
