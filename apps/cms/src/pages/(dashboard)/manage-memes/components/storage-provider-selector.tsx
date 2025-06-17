import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { Layers } from 'lucide-react';

export type StorageProvider = 'all' | 'appwrite' | 'imagekit';

interface StorageProviderSelectorProps {
  selectedStorage: StorageProvider;
  onSelect: (provider: StorageProvider) => void;
}

export function StorageProviderSelector({
  selectedStorage,
  onSelect,
}: StorageProviderSelectorProps) {
  const { theme } = useTheme();

  const getLogoPath = (provider: 'appwrite' | 'imagekit') => {
    const variant = theme === 'dark' ? 'dark' : 'light';
    return `/logos/svgs/${provider}/${variant}.svg`;
  };
  return (
    <div className="flex items-center space-x-4">
      <span className="!text-base font-medium">Storage:</span>
      <div className="flex space-x-2">
        <Button
          variant={selectedStorage === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect('all')}
          className="h-auto px-4 py-2 flex items-center justify-center"
        >
          <Layers className="!h-6 !w-6 mr-1" />
          <span className="!text-sm">All</span>
        </Button>
        <Button
          variant={selectedStorage === 'appwrite' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect('appwrite')}
          className="h-auto px-4 py-2 flex items-center justify-center"
        >
          <img src={getLogoPath('appwrite')} alt="Appwrite" className="h-6 w-auto" />
        </Button>
        <Button
          variant={selectedStorage === 'imagekit' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect('imagekit')}
          className="h-auto px-4 pt-3 pb-1 flex items-center justify-center"
        >
          <img src={getLogoPath('imagekit')} alt="ImageKit" className="h-6 w-auto" />
        </Button>
      </div>
    </div>
  );
}
