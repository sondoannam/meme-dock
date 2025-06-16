import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { mockGifs } from '../mock-data';
import { SelectOption } from '@/components/custom/basic-select';

interface GifsTabProps {
  relationOptions: {
    tags: SelectOption[];
    objects: SelectOption[];
    moods: SelectOption[];
  };
  onRefreshRelations: () => void;
}

export default function GifsTab({ relationOptions, onRefreshRelations }: GifsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Meme GIFs</CardTitle>
        <CardDescription>Demo view for GIF collection management</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockGifs.map((gif) => (
            <Card key={gif.id} className="overflow-hidden hover:shadow-md transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img src={gif.url} alt={gif.title} className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <p className="text-white text-sm font-medium">{gif.title}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
          <p className="text-muted-foreground">Full GIF management functionality coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
}
