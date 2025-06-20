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

// Helper function for localStorage operations
const persistToStorage = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to persist ${key} to localStorage:`, error);
    }
  }
};

const getFromStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn(`Failed to retrieve ${key} from localStorage:`, error);
      return null;
    }
  }
  return null;
};

export const useMemeCollectionStore = create<MemeCollectionState & MemeCollectionAction>((set) => ({
  memeCollection: getFromStorage('memeCollection'),
  objectCollection: getFromStorage('objectCollection'),
  tagCollection: getFromStorage('tagCollection'),
  moodCollection: getFromStorage('moodCollection'),
  setMemeCollection: (collection) =>
    set(() => {
      persistToStorage('memeCollection', collection);
      return { memeCollection: collection };
    }),
  setObjectCollection: (collection) =>
    set(() => {
      persistToStorage('objectCollection', collection);
      return { objectCollection: collection };
    }),
  setTagCollection: (collection) =>
    set(() => {
      persistToStorage('tagCollection', collection);
      return { tagCollection: collection };
    }),
  setMoodCollection: (collection) =>
    set(() => {
      persistToStorage('moodCollection', collection);
      return { moodCollection: collection };
    }),
}));
