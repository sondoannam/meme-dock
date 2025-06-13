// Mock data for demo presentation
export const mockImages = Array.from({ length: 24 }).map((_, i) => ({
  id: `img-${i}`,
  title: `Meme Image ${i + 1}`,
  url: `https://source.unsplash.com/random/300x300?sig=${i}`,
}));

export const mockGifs = Array.from({ length: 8 }).map((_, i) => ({
  id: `gif-${i}`,
  title: `Funny GIF ${i + 1}`,
  url: `https://media.giphy.com/media/3o7TKSjRrfIPjeiVyU/giphy.gif`,
}));

export const mockVideos = Array.from({ length: 6 }).map((_, i) => ({
  id: `video-${i}`,
  title: `Meme Video ${i + 1}`,
  thumbnail: `https://source.unsplash.com/random/300x200?cinema,sig=${i}`,
  duration: '0:15',
}));
