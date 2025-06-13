import MemesGalleryTabs from './components/memes-gallery-tabs';

export const Component = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="!text-3xl font-bold mb-6">
        <span className="text-brand-yellow-2 !text-3xl">Memes</span> Gallery
      </h1>
      <MemesGalleryTabs />
    </div>
  );
};
