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
  },
  {
    id: 'snow-rider-3d',
    title: 'Snow Rider 3D',
    description: 'High-speed downhill simulation through a frozen wasteland.',
    thumbnail: 'https://picsum.photos/seed/snow/400/225',
    iframeUrl: 'https://html5.gamedistribution.com/rvvASMiM/3b79a8537ebc414fb4f9672a9b8c68c8/index.html?utm_source=gamedistribution.com&utm_medium=snow-rider-3d&utm_campaign=block-and-redirect&gd_zone_config=eyJwYXJlbnRVUkwiOiJodHRwczovL2h0bWw1LmdhbWVkaXN0cmlidXRpb24uY29tLzNiNzlhODUzN2ViYzQxNGZiNGY5NjcyYTliOGM2OGM4Lz91dG1fc291cmNlPWdhbWVkaXN0cmlidXRpb24uY29tJnV0bV9tZWRpdW09c25vdy1yaWRlci0zZCZ1dG1fY2FtcGFpZ249YmxvY2stYW5kLXJlZGlyZWN0IiwicGFyZW50RG9tYWluIjoiaHRtbDUuZ2FtZWRpc3RyaWJ1dGlvbi5jb20iLCJ0b3BEb21haW4iOiJodG1sNS5nYW1lZGlzdHJpYnV0aW9uLmNvbSIsImhhc0ltcHJlc3Npb24iOmZhbHNlLCJsb2FkZXJFbmFibGVkIjp0cnVlLCJob3N0IjoiaHRtbDUuZ2FtZWRpc3RyaWJ1dGlvbi5jb20iLCJ2ZXJzaW9uIjoiMS41LjE4In0%253D',
    category: 'Action'
  },
  {
    id: 'smash-karts',
    title: 'Smash Karts',
    description: 'A high-speed multiplayer kart battle arena. Drive fast, fire rockets, and make big explosions.',
    thumbnail: 'https://picsum.photos/seed/kart/400/225',
    iframeUrl: './smash-karts.html',
    category: 'Action'
  }
];
