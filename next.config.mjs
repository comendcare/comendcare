/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "storage.googleapis.com",
                port: "",
                pathname: "**"
            },
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
            {
                protocol: 'https',
                hostname: 'avatar.vercel.sh',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'www.google.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'abs.twimg.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'pbs.twimg.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'flag.vercel.app',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'illustrations.popsy.co',
                port: '',
                pathname: '**',
            },
        ]
    },
    experimental: {
        serverActions: {
          bodySizeLimit: '5mb',
        },
      },
}

export default nextConfig
