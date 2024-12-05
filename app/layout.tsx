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
import { FeedbackForm } from "@/components/feedback"

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

const steps: Tour[] = [
    {
        tour: "research-plan-tour",
        steps: [
            {
                icon: <>👋</>,
                title: "Adding a Milestone",
                content: <>{`Start building your research plan by adding a new milestone.`}</>,
                selector: ".research-plan-tour-step1",
                side: "top" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: <>⭐</>,
                title: "Milestones",
                content: <>{`Milestones are the goals and projects that make up your research plan. You can click the 'Details' button to edit the contents of each milestone.`}</>,
                selector: ".research-plan-tour-step2",
                side: "left" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Editing Milestones",
                content: <>{`You can edit the details of a milestone in the edit panel.`}</>,
                selector: ".research-plan-tour-step3",
                side: "left" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Saving a Milestone",
                content: <>{`Click the save button to submit your changes.`}</>,
                selector: ".research-plan-tour-step4",
                side: "top-right" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Connecting Milestones",
                content: <>{`Once you've created more than one milestone, you can create relationships between them by dragging from the + icon.`}</>,
                selector: ".research-plan-tour-step5",
                side: "left" as any,
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
                selector: ".research-plan-tour-step5",
                side: "left" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
        ]
    },
    {
        tour: "organization-profile-tour",
        steps: [
            {
                icon: <>👋</>,
                title: "About your organization",
                content: <>{`Your organization's information and members can be found here.`}</>,
                selector: ".organization-profile-tour-step1",
                side: "top" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: <>👋</>,
                title: "Updating your organization",
                content: <>{`If you'd like to update your organization's information, visit the settings page.`}</>,
                selector: ".organization-profile-tour-step2",
                side: "right" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: <>⭐</>,
                title: "About your condition",
                content: <>{`Information about your condition will appear here. To edit it, visit the condition page.`}</>,
                selector: ".organization-profile-tour-step3",
                side: "top" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Your miletones",
                content: <>{`Your milestones include assets (the results of completed milestones) and projects (ongoing or proposal-stage milestones. To update them, visit the research planner.`}</>,
                selector: ".organization-profile-tour-step4",
                side: "left" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Your roadmap",
                content: <>{`A timeline view of your roadmap will be found here. To see the entire roadmap and to edit details, visit the research planner.`}</>,
                selector: ".organization-profile-tour-step5",
                side: "top-right" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Your organization's activity",
                content: <>{`All posts related to your organization will appear in this tab.`}</>,
                selector: ".organization-profile-tour-step6",
                side: "left" as any,
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
                            {/* <FeedbackForm /> */}
                        </Onborda>
                    </ThemeProvider>
                </Providers>
            </body>
        </html>
    )
}