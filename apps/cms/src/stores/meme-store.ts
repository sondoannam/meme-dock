import { CollectionSchemaType } from '@/validators';
import { create } from 'zustand';

type MemeCollectionState = {
  memeCollection: CollectionSchemaType | null;
};

type MemeCollectionAction = {
  setMemeCollection: (collection: CollectionSchemaType | null) => void;
};

export const useMemeCollectionStore = create<MemeCollectionState & MemeCollectionAction>((set) => ({
  memeCollection: null,
  setMemeCollection: (collection) =>
    set(() => ({
      memeCollection: collection,
    })),
}));
