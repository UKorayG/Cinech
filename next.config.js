/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Commented out for Coinbase Wallet SDK compatibility
          // {
          //   key: 'Cross-Origin-Opener-Policy',
          //   value: 'same-origin',
          // },
          // Commented out for Coinbase Wallet SDK compatibility
          // {
          //   key: 'Cross-Origin-Embedder-Policy',
          //   value: 'require-corp',
          // },
          // Commented out for development
          // {
          //   key: 'Access-Control-Allow-Origin',
          //   value: 'http://localhost:3000',
          // },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
