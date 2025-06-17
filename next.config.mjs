/** @type {import('next').NextConfig} */
const nextConfig = {  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.thetshirtmill.com.au",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      }
    ],
  },
};

export default nextConfig;
