import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageIcon } from 'lucide-react';
import ImagesTab from './tabs/images-tab';
import GifsTab from './tabs/gifs-tab';
import VideosTab from './tabs/videos-tab';
import { Icons } from '@/components/icons';

export type MemeType = 'images' | 'gifs' | 'videos';

export default function MemesGalleryTabs() {
  const [activeTab, setActiveTab] = useState<MemeType>('images');

  return (
    <Tabs
      defaultValue="images"
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as MemeType)}
      className="w-full"
    >
      <TabsList className="!h-auto grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="images" className="!text-base py-3">
          <ImageIcon className="mr-2 !h-6 !w-6" />
          Images
        </TabsTrigger>
        <TabsTrigger value="gifs" className="!text-base py-3">
          <Icons.Gif className="mr-2 !h-6 !w-6" />
          GIFs
        </TabsTrigger>
        <TabsTrigger value="videos" className="!text-base py-3">
          <Icons.Video className="mr-2 !h-6 !w-6" />
          Videos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="images" className="mt-4">
        <ImagesTab />
      </TabsContent>

      <TabsContent value="gifs">
        <GifsTab />
      </TabsContent>

      <TabsContent value="videos">
        <VideosTab />
      </TabsContent>
    </Tabs>
  );
}
