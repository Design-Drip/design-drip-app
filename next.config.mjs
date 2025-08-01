/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
      },
      {
        protocol: "https",
        hostname: "gti33638oe.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        port: "",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "gti33638oe.ufs.sh",
      }
    ],
  },
};

export default nextConfig;
