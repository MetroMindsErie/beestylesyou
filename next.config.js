/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['rzdoygryvifvcmhhbiaq.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rzdoygryvifvcmhhbiaq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig