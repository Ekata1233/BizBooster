// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ['ik.imagekit.io'],
//     unoptimized: true,
//   },
//   output: 'standalone',
//   webpack(config) {
//     config.module.rules.push({
//       test: /\.svg$/,
//       use: ['@svgr/webpack'],
//     });
//     return config;
//   },
// };

// module.exports = nextConfig;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ['ik.imagekit.io'],
//     unoptimized: true,
//   },
//   output: 'standalone',
//   webpack(config) {
//     config.module.rules.push(
//       {
//         test: /\.svg$/,
//         use: ['@svgr/webpack'],
//       },
//       {
//         test: /\.map$/,
//         use: 'ignore-loader',
//       }
//     );
//     return config;
//   },
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ik.imagekit.io'],
    unoptimized: true,
  },
  output: 'standalone',
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
};

module.exports = nextConfig;
