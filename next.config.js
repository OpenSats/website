/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: process.env.STRAPI_CDN_PROTOCOL,
        hostname: process.env.STRAPI_CDN_HOST,
        port: process.env.STRAPI_CDN_PORT,
        pathname: process.env.STRAPI_CDN_PATHNAME,
      },
    ],
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
}

module.exports = nextConfig
