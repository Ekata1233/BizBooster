/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ik.imagekit.io'],
    unoptimized: true,
  },
  output: 'standalone',
  
  // ✅ ADD THIS: Increase API body size limit
  api: {
    bodyParser: {
      sizeLimit: '20mb', // Increased to 20MB
    },
  },
  
  // ✅ ALSO ADD: If you're using Next.js 13+ with App Router
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  
  typescript: {
    // ✅ Allow production builds to complete even with type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Allow production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.module.rules.push(
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.map$/,
        use: 'ignore-loader',
      }
    );
    return config;
  },
  
  // ✅ OPTIONAL: For custom server configuration
  serverRuntimeConfig: {
    // This will only be available on the server side
    maxBodySize: '20mb',
  },
  publicRuntimeConfig: {
    // This will be available on both server and client
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;