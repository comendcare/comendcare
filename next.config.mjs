/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "loremflickr.com",
                port: "",
                pathname: "**"
            },
            {
                protocol: "https",
                hostname: "flowbite.s3.amazonaws.com",
                port: "",
                pathname: "**"
            },
            {
                protocol: "https",
                hostname: "api.microlink.io",
                port: "",
                pathname: "**"
            },
            {
                protocol: "https",
                hostname: "assets.aceternity.com",
                port: "",
                pathname: "**"
            },
            {
                protocol: "https",
                hostname: "public.blob.vercel-storage.com",
                port: "",
                pathname: "**"
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '**',
            },
        ]
    }
}

export default nextConfig
