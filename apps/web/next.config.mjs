/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
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
                hostname: "tools.aceternity.com",
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
            {
                protocol: 'https',
                hostname: 'www.notion.so',
                port: '',
                pathname: '**'
            }, {
                protocol: 'https',
                hostname: 's3-us-west-2.amazonaws.com',
                port: '',
                pathname: '**'
            }, {
                protocol: 'https',
                hostname: 'img.notionusercontent.com',
                port: '',
                pathname: '**'
            }, {
                protocol: 'https',
                hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
                port: '',
                pathname: '**'
            }
        ]
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
        optimizePackageImports: [
            'lucide-react',
            '@tabler/icons-react',
            '@radix-ui/react-icons',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@udecode/plate-basic-marks',
            '@udecode/plate-common',
            '@udecode/plate-core',
            '@udecode/plate-emoji',
            '@udecode/plate-floating',
            '@udecode/plate-link',
            '@udecode/plate-list',
            '@udecode/plate-paragraph',
            '@udecode/plate-table',
            '@udecode/plate-heading',
            '@udecode/plate-image',
            '@udecode/plate-media',
            '@udecode/plate-comments',
            '@udecode/plate-combobox',
            '@udecode/plate-mention',
            '@udecode/plate-kbd'
        ],
    },
}

export default nextConfig
