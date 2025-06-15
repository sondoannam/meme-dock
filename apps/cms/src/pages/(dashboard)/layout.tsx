import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/layouts/app-sidebar';
import MainLayout from '@/layouts/main-layout';
import { useAuthCheck } from '@/hooks/use-auth-check';
import { ROUTE_PATH } from '@/constants/routes';
import { useRequest, useUpdateEffect } from 'ahooks';
import { collectionApi } from '@/services/collection';
import { useMemeCollectionStore } from '@/stores/meme-store';

/**
 * Layout component for dashboard routes
 * This layout checks if the user is authenticated and has admin privileges
 */
export function Component() {
  // Use the auth check hook to handle authentication and admin checks
  const { isLoading } = useAuthCheck({
    requireAuth: true,
    requireAdmin: true,
    redirectTo: ROUTE_PATH.LOGIN,
    storeRedirectPath: true,
  });

  const {
    memeCollection,
    setMemeCollection,
    objectCollection,
    setObjectCollection,
    tagCollection,
    setTagCollection,
    moodCollection,
    setMoodCollection,
  } = useMemeCollectionStore((state) => state);

  const { run } = useRequest(collectionApi.getCollections, {
    onSuccess: (data) => {
      if (data.length === 0) {
        return;
      }

      if (!memeCollection) {
        const meme = data.find((collection) => collection.name === 'meme');
        if (meme) {
          setMemeCollection(meme);
        }
      }
      if (!objectCollection) {
        const object = data.find((collection) => collection.name === 'object');
        if (object) {
          setObjectCollection(object);
        }
      }
      if (!tagCollection) {
        const tag = data.find((collection) => collection.name === 'tag');
        if (tag) {
          setTagCollection(tag);
        }
      }
      if (!moodCollection) {
        const mood = data.find((collection) => collection.name === 'mood');
        if (mood) {
          setMoodCollection(mood);
        }
      }
    },
  });

  useUpdateEffect(() => {
    if (!isLoading && !memeCollection && !objectCollection && !tagCollection && !moodCollection) {
      run();
    }
  }, [isLoading]);

  // If user has admin privileges and API access, render the dashboard layout
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <MainLayout />
      </div>
    </SidebarProvider>
  );
}
