import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/favicon.ico',
      },
      {
        protocol: 'https',
        hostname: 'yandex.ru',
        port: '',
        pathname: '/favicon.ico',
      },
    ],
  },
  // If Droid Sans Mono needs specific handling or isn't available via Google Fonts,
  // additional configuration might be needed here, but next/font handles it usually.
};

export default nextConfig;
