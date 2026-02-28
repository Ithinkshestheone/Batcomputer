export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  iframeUrl: string;
  category: 'Action' | 'Puzzle' | 'Arcade' | 'Retro';
}

export const GAMES: Game[] = [
  {
    id: 'asdd',
    title: 'AS-DD',
    description: 'A mysterious data-stream challenge from the deep web.',
    thumbnail: 'https://picsum.photos/seed/asdd/400/225',
    iframeUrl: 'https://html-classic.itch.zone/html/15867499/asdd/index.html',
    category: 'Action'
  },
  {
    id: 'compass',
    title: 'Compass',
    description: 'A high-security navigation protocol recovered from a forgotten server.',
    thumbnail: 'https://picsum.photos/seed/compass/400/225',
    iframeUrl: 'https://harshulmoon.github.io/FNAE-HTML5-1.2.3/index.html',
    category: 'Arcade'
  }
];
