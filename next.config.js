/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'static.wikia.nocookie.net',
      },
      {
        protocol: 'https',
        hostname: 'www.freepngimg.com',
      },
      {
        protocol: 'https',
        hostname: 'freepngimg.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    unoptimized: true,
  },
  // Mark firebase-admin as server-only external package
  serverExternalPackages: ['firebase-admin'],
}

module.exports = nextConfig

