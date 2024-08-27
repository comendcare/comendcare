import {Inter, Lexend} from 'next/font/google'
import clsx from 'clsx'

import '@/styles/tailwind.css'
import {type Metadata} from 'next'
import {Header} from "@/components/Header";

export const metadata: Metadata = {
    title: {
        template: '%s - Comend',
        default: 'Comend - Tools for research ready patient groups.',
    },
    description:
        'From growing your organization and educating stakeholders to advancing research, we’re building the tools to help.',
    keywords: `Comend, Librarey, Rare Disease, Disability Resource Guide, Support`,
    openGraph: {
        title: `Comend - Building tech for rare diseases`,
        // images: landingScreenshot.src, Handled by opengraph-image.tsx
        description: `We build software to help those affected by rare disease find resources, learn about their disorder, and discover new treatments.`,
        locale: `en_US`
    }
}

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
})

const lexend = Lexend({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-lexend',
})

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html
            lang="en"
            className={clsx(
                'h-full scroll-smooth bg-white antialiased',
                inter.variable,
                lexend.variable,
            )}
        >
        <body className="flex h-full flex-col">
            <Header/>
            {children}
        </body>
        </html>
    )
}
