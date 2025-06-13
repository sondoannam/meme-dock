import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { mockVideos } from '../mock-data';

export default function VideosTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Meme Videos</CardTitle>
        <CardDescription>Demo view for video collection management</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockVideos.map((video) => (
            <Card
              key={video.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
                      <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <CardFooter className="p-3">
                <p className="font-medium">{video.title}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
          <p className="text-muted-foreground">
            Full video management functionality coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
