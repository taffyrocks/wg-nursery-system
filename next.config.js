/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'), // Resolves '@' to the 'src' directory
    };
    return config;
  },
}

module.exports = nextConfig;
