import "./globals.css"
import { ThemeProvider } from "@/app/theme-provider"
import type { Metadata, ResolvingMetadata } from "next"

// Import Montserrat Display and Source Sans Pro
import { Poppins, Source_Sans_3 } from "next/font/google"
import { Providers } from "@/app/providers"
import Onborda from "@/components/onborda/Onborda"
import OnboardingCard from "@/components/ui/onboarding-card"
import { Tour } from "@/components/onborda/types"
import gif1 from "@/public/onboarding-gif-1.gif"
import Image from "next/image"

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
            url: `https://www.joincomend.com/`,
            siteName: "Comend",
            locale: "en_US"
        },
        robots: {
            index: true,
            follow: true
        }
    }
}

const steps: Tour[] = [
    {
        tour: "roadmap-tour",
        steps: [
            {
                icon: <>👋</>,
                title: "Adding a Milestone",
                content: <>{`Start building your research map by adding a new milestone.`}</>,
                selector: ".roadmap-tour-step1",
                side: "top" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: <>⭐</>,
                title: "Milestones",
                content: <>{`Milestones are the goals and projects that make up your research map. You can click the 'Details' button to edit the contents of each milestone.`}</>,
                selector: ".roadmap-tour-step2",
                side: "top" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Editing Milestones",
                content: <>{`You can edit the details of a milestone in the edit panel.`}</>,
                selector: ".roadmap-tour-step3",
                side: "left" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Saving a Milestone",
                content: <>{`Click the save button to submit your changes.`}</>,
                selector: ".roadmap-tour-step4",
                side: "top-right" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Connecting Milestones",
                content: <>{`Once you've created more than one milestone, you can create relationships between them by dragging from the + icon.`}</>,
                selector: ".roadmap-tour-step5",
                side: "top" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Re-Ordering Milestones",
                content: <>
                    {`You can delete edges with the delete or backspace key on your keyboard. Re-connecting the milestones allows you to update their dependancy order.`}
                    <Image src={gif1} alt="Short animation. Shows deleting an edge, from between two notes, then re-connecting a node in the middle."/>
                </>,
                selector: ".roadmap-tour-step5",
                side: "top" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
        ]
    },
    {
        tour: "empty-roadmap-tour",
        steps: [
            {
                icon: <>👋</>,
                title: "Adding a Milestone",
                content: <>{`Start building your research map by adding a new milestone.`}</>,
                selector: ".empty-roadmap-tour-step1",
                side: "top" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: <>⭐</>,
                title: "Milestones",
                content: <>{`Milestones are the goals and projects that make up your research map. You can click the 'Details' button to edit the contents of each milestone.`}</>,
                selector: ".roadmap-tour-step2",
                side: "top" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Editing Milestones",
                content: <>{`You can edit the details of a milestone in the edit panel.`}</>,
                selector: ".roadmap-tour-step3",
                side: "left" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Saving a Milestone",
                content: <>{`Click the save button to submit your changes.`}</>,
                selector: ".roadmap-tour-step4",
                side: "top-right" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Connecting Milestones",
                content: <>{`Once you've created more than one milestone, you can create relationships between them by dragging from the + icon.`}</>,
                selector: ".roadmap-tour-step5",
                side: "top" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Re-Ordering Milestones",
                content: <>
                    {`You can delete edges with the delete or backspace key on your keyboard. Re-connecting the milestones allows you to update their dependancy order.`}
                    <Image src={gif1} alt="Short animation. Shows deleting an edge, from between two notes, then re-connecting a node in the middle."/>
                </>,
                selector: ".roadmap-tour-step5",
                side: "top" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
        ]
    }
]

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
            <body>
                <Providers>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem={false}
                        disableTransitionOnChange
                    >
                        <Onborda steps={steps} cardComponent={OnboardingCard}>
                            {children}
                        </Onborda>
                    </ThemeProvider>
                </Providers>
            </body>
        </html>
    )
}
