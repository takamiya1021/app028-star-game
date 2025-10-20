import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Stellarium Quiz - 星空クイズ',
    short_name: '星空クイズ',
    description: '星々の海を旅しながらクイズに挑戦しよう',
    start_url: '/',
    display: 'standalone',
    background_color: '#000814',
    theme_color: '#1e40af',
    icons: [
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-180.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
