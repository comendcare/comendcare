"use client"
import { encode } from "qss"
import React, { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import Image from "next/image"
import roadmap from "@/public/illustrations/roadmap.png"
import timeline from "@/public/illustrations/timeline.png"
import kanban from "@/public/illustrations/kanban.png"

export const imgWidth = 400
export const imgHeight = 250

const tabContent = {
    profiles: {
        title: "Research Roadmaps",
        image: <Image
            src={`https://api.microlink.io/?${encode({
                url: "https://comend-refresh-sprint-3.vercel.app/pag/profile/ACME%20Syndrome%20Foundation",
                screenshot: true,
                meta: false,
                embed: "screenshot.url",
                colorScheme: "dark",
                "viewport.isMobile": true,
                "viewport.deviceScaleFactor": 1,
                "viewport.width": imgWidth * 3,
                "viewport.height": imgHeight * 3,
            })}`}
            quality={100}
            layout="responsive"
            priority={true}
            className="rounded-lg object-cover"
            alt="preview image"
            width={imgWidth}
            height={imgHeight}
        />,
        description: "Develop your research strategy with the help of playbooks and other groups. Then organize your tasks and share your roadmap with others.",
    },
    marketplace: {
        title: "Rare Marketplace",
        image: (
            <Image
                src={`https://api.microlink.io/?${encode({
                    url: "https://comend-refresh-sprint.vercel.app/researcher",
                    screenshot: true,
                    meta: false,
                    embed: "screenshot.url",
                    colorScheme: "dark",
                    "viewport.isMobile": true,
                    "viewport.deviceScaleFactor": 1,
                    "viewport.width": imgWidth * 3,
                    "viewport.height": imgHeight * 3
                })}`}
                quality={100}
                layout="responsive"
                priority={true}
                className="rounded-lg object-cover"
                alt="preview image"
                width={imgWidth}
                height={imgHeight}
            />
        ),
        description:
            "Find and learn about those who can help you advance your research objectives based on shared biologies, projects, or goals."
    },
    forums: {
        title: "Research Forums",
        image: <Image
            src={`https://api.microlink.io/?${encode({
                url: "https://comend-refresh-sprint-3.vercel.app/pag/project/Potassium%20Ion%20Channels/discussion",
                screenshot: true,
                meta: false,
                embed: "screenshot.url",
                colorScheme: "dark",
                "viewport.isMobile": true,
                "viewport.deviceScaleFactor": 1,
                "viewport.width": imgWidth * 3,
                "viewport.height": imgHeight * 3,
            })}`}
            quality={100}
            layout="responsive"
            priority={true}
            className="rounded-lg object-cover"
            alt="preview image"
            width={imgWidth}
            height={imgHeight}
        />,
        description: "Learn or share about challenges, wins, and the latest news in rare disease science and drug development.",
    },
};

export default function TabsFeaturesSection() {
    const [activeTab, setActiveTab] = useState("profiles")
    const tabs = ["profiles", "marketplace", "forums"]
    const tabDuration = 8

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTab(prev => {
                const currentIndex = tabs.indexOf(prev)
                const nextIndex = (currentIndex + 1) % tabs.length
                return tabs[nextIndex] as string
            })
        }, tabDuration * 1000)

        return () => clearInterval(interval)
    }, [activeTab])

    const handleTabChange = (newValue: string) => {
        setActiveTab(newValue)
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: [50, -10, 0] }}
            transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
            id="features"
            className="w-full container mx-auto max-w-7xl px-8 py-24 sm:py-24 space-y-8"
            aria-labelledby="features-heading"
        >
            <div className="flex flex-col justify-center items-center md:w-1/2 mx-auto text-center">
                <div>
                    <h2
                        id="features-heading"
                        className="text-lg text-primary mb-2 tracking-wider"
                    >
                        Platform
                    </h2>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                        The accelerator for patient-led research
                    </h3>
                    <p className="text-xl text-muted-foreground mb-8">
                        Comend supports patient groups from formation to IND approval.
                        Find grants, connect with researchers, contract CROs, and more - all from one intuitive platform.
                    </p>
                </div>
            </div>

            {/* Display tabs only on large screens */}
            <div className="hidden md:block">
                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange as any}
                    className="flex flex-row space-x-8"
                    aria-live="polite"
                >
                    <TabsList className="grid grid-row-3 items-start justify-start bg-transparent border-none shadow-none h-min">
                        {tabs.map(tab => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="flex flex-col items-start space-y-8 relative bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:bg-gray-100 transition-colors duration-300 rounded-lg p-4 md:p-6"
                                aria-controls={`${tab}-tab`}
                                id={`${tab}-tab`}
                                role="tab"
                            >
                                <div className="relative w-full h-1 bg-gray-300">
                                    {activeTab === tab && (
                                        <motion.div
                                            className="absolute top-0 left-0 h-full bg-sky-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{
                                                duration: tabDuration,
                                                ease: "linear"
                                            }}
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col items-start text-wrap text-start space-y-8 mt-4">
                                    <h3
                                        id={`${tab}-tab-title`}
                                        className="text-black text-2xl font-semibold leading-none tracking-tight"
                                    >
                                        {
                                            tabContent[
                                                tab as keyof typeof tabContent
                                            ].title
                                        }
                                    </h3>
                                    <p
                                        id={`${tab}-tab-description`}
                                        className="text-muted-foreground text-base"
                                    >
                                        {
                                            tabContent[
                                                tab as keyof typeof tabContent
                                            ].description
                                        }
                                    </p>
                                </div>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {tabs.map(
                        tab =>
                            activeTab === tab && (
                                <TabsContent
                                    key={tab}
                                    value={tab}
                                    aria-labelledby={`${tab}-tab-title`}
                                    aria-describedby={`${tab}-tab-description`}
                                    className="flex justify-center items-center w-full max-w-7xl mx-auto bg-gradient-to-b p-8 from-80% from-[#87EBA4]/70 to-[#87CEEB]/70 to-100% rounded-lg"
                                >
                                    <div className="relative w-[750px] h-[470px] max-w-7xl rounded-lg">
                                        {
                                            tabContent[
                                                tab as keyof typeof tabContent
                                            ].image
                                        }
                                    </div>
                                </TabsContent>
                            )
                    )}
                </Tabs>
            </div>

            {/* Mobile-friendly version */}
            <div className="block md:hidden space-y-8">
                {tabs.map(tab => (
                    <div key={tab} className="flex flex-col space-y-4">
                        <div className="relative w-full h-auto">
                            {tabContent[tab as keyof typeof tabContent].image}
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <h3 className="text-xl font-semibold">
                                {
                                    tabContent[tab as keyof typeof tabContent]
                                        .title
                                }
                            </h3>
                            <p className="text-base text-muted-foreground">
                                {
                                    tabContent[tab as keyof typeof tabContent]
                                        .description
                                }
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </motion.section>
    )
}
