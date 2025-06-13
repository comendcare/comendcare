import "./globals.css"
import { ThemeProvider } from "@/app/theme-provider"
import type { Metadata, ResolvingMetadata } from "next"
import { Analytics } from '@vercel/analytics/next';

// Import Montserrat Display and Source Sans Pro
import { Poppins, Source_Sans_3 } from "next/font/google"
import { Providers } from "@/app/providers"
import Onborda from "@/components/onborda/Onborda"
import OnboardingCard from "@/components/ui/onboarding-card"
import { Tour } from "@/components/onborda/types"
import gif1 from "@/public/onboarding-gif-1.gif"
import Image from "next/image"
import { FeedbackSheet } from "@/components/feedback"
import { Suspense } from "react"
import Loading from "./loading";
import { onbordaTours } from "@/state/onborda/onbordaStore";
import Script from 'next/script';


// Set up Playfair Display and Source Sans 3 fonts
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "700"], // Regular and bold weights
    variable: "--font-poppins", // Create a CSS variable for the font
    display: "swap"
})

const sourceSans3 = Source_Sans_3({
    subsets: ["latin"],
    weight: ["400", "700"], // Regular and bold weights
    variable: "--font-source-sans-pro", // Create a CSS variable for the font
    display: "swap"
})

export async function generateMetadata(): Promise<Metadata> {
    // { params, searchParams }: Props,
    // parent: ResolvingMetadata
    // optionally access and extend (rather than replace) parent metadata
    // const previousImages = (await parent).openGraph?.images || []

    return {
        title: "Comend",
        description: "Software for rare disease patient groups",
        generator: "Next.js",
        applicationName: "Comend",
        referrer: "origin-when-cross-origin",
        keywords: [
            "Comend",
            "Rare Disease",
            "Genetic Disorders",
            "Orphan Diseases",
            "Drug Development",
            "Patient Advocacy Groups",
            "Researchers"
        ],
        authors: [
            { name: "Flawnson", url: "http://flawnson.com/" },
            {
                name: "Albert",
                url: "https://www.linkedin.com/in/albert-yq-wang/"
            }
        ],
        creator: "Flawnson Tong",
        publisher: "Flawnson Tong",
        openGraph: {
            title: "Comend - Tech for Rare Disease Patient Groups",
            description:
                "Collaborate with researchers and patient advocacy groups.",
            url: `https://www.comend.io/`,
            siteName: "Comend",
            locale: "en_US"
        },
        robots: {
            index: true,
            follow: true
        }
    }
}

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${poppins.variable} ${sourceSans3.variable}`}
        >
            <head>
                {/* consent scripts added so cookieyes can block cookies & localStorage where necessary, if the user has not consented */}
                {process.env.NODE_ENV !== "production" ? (
                    <>
                    <script
                        data-cookieyes='cookieyes-functional'
                        src={`https://comend.io/functional-localstorage-manager.js`}
                    />
                    <script
                        data-cookieyes='cookieyes-analytics'
                        src={`https://comend.io/analytics-localstorage-manager.js`}
                    />
                    </>
                ) : (
                    <>
                    <script
                        id="cookieyes"
                        type="text/javascript"
                        src={`https://cdn-cookieyes.com/client_data/${process.env.COOKIE_YES_WEBSITE_KEY}/script.js`}
                    ></script>
                    <script
                        data-cookieyes='cookieyes-functional'
                        src={`https://comend.io/functional-localstorage-manager.js`}
                    />
                    <script
                        data-cookieyes='cookieyes-analytics'
                        src={`https://comend.io/analytics-localstorage-manager.js`}
                    />
                    </>
                )}
            </head>
            <body>
                <Suspense fallback={<Loading />}>
                <Providers>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem={false}
                        disableTransitionOnChange
                    >
                        <Onborda steps={onbordaTours} cardComponent={OnboardingCard}>
                            {children}
                            {/* <FeedbackForm /> */}
                            <Analytics />
                        </Onborda>
                    </ThemeProvider>
                </Providers>
                </Suspense>
            </body>
        </html>
    )
}
