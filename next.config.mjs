/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        domains: ["utfs.io", "uploadthing.com", "banner2.cleanpng.com", "pics.craiyon.com"] //use remotePatterns
    },
    eslint: {
        ignoreDuringBuilds: true
    }
};

export default nextConfig;
