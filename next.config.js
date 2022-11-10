/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com']
  },
  env: {
    AUTH_KEY: 'secret_npYubty5LrYRwmF8td94sTk5T6d1IpUBP9wizHzi1Zn',
    DATABASE_ID: 'dcf901c081424e1e8cc0a7230add4381'
  }
}

module.exports = nextConfig
