/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NFT_CONTRACT_ADDRESS: process.env.NFT_CONTRACT_ADDRESS,
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
