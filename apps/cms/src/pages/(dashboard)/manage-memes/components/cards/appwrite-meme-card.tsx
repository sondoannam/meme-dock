import { useState } from 'react';
import { Edit, Globe, Tag, Users, Package, SmilePlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

import { MemeDocument } from '@/types';
import { getAppwriteImageUrl } from '@/lib/utils';

interface MemeWithImage extends MemeDocument {
  imageUrl?: string;
}

interface MemeCardProps {
  meme: MemeWithImage;
  tagNames?: Record<string, string>;
  objectNames?: Record<string, string>;
  moodNames?: Record<string, string>;
  onEdit?: (memeId: string) => void;
}

export function MemeCard({
  meme,
  tagNames = {},
  objectNames = {},
  moodNames = {},
  onEdit,
}: MemeCardProps) {
  const [showVietnamese, setShowVietnamese] = useState(false);

  const toggleLanguage = () => {
    setShowVietnamese((prev) => !prev);
  };

  // Construct image URL directly based on fileId
  const imageUrl =
    meme.saved_platform === 'appwrite' && meme.fileId
      ? getAppwriteImageUrl(meme.fileId, 'view')
      : meme.imageUrl;

  // Get preview image for thumbnails
  const previewUrl =
    meme.saved_platform === 'appwrite' && meme.fileId
      ? getAppwriteImageUrl(meme.fileId, 'preview', { width: 400, height: 400, quality: 80 })
      : meme.imageUrl;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-square relative overflow-hidden group">
        {/* Image */}
        {imageUrl ? (
          <img
            src={previewUrl || imageUrl}
            alt={showVietnamese ? meme.title_vi : meme.title_en}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-102"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Image not available</p>
          </div>
        )}

        {/* Edit button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
            onClick={() => onEdit && onEdit(meme.id)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit meme</span>
          </Button>
        </div>
      </div>

      <CardContent className="p-3 space-y-2">
        {/* Title with language toggle */}
        <div className="flex justify-between items-start gap-1">
          <h3 className="font-medium truncate text-sm flex-1">
            {showVietnamese ? meme.title_vi : meme.title_en}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full shrink-0"
            onClick={toggleLanguage}
          >
            <Globe className="h-4 w-4" />
            <span className="sr-only">Toggle language</span>
          </Button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {meme.tagIds.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 hover:bg-secondary/50 cursor-help"
                >
                  <Tag className="h-3 w-3" />
                  <span>{meme.tagIds.length}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px]">
                <p>{meme.tagIds.map((id) => tagNames[id] || id).join(', ')}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {meme.objectIds.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 hover:bg-secondary/50 cursor-help"
                >
                  <Package className="h-3 w-3" />
                  <span>{meme.objectIds.length}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px]">
                <p>{meme.objectIds.map((id) => objectNames[id] || id).join(', ')}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {meme.moodIds.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 hover:bg-secondary/50 cursor-help"
                >
                  <SmilePlus className="h-3 w-3" />
                  <span>{meme.moodIds.length}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px]">
                <p>{meme.moodIds.map((id) => moodNames[id] || id).join(', ')}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Usage count */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{meme.usageCount || 0} uses</span>
        </div>
      </CardContent>
    </Card>
  );
}
