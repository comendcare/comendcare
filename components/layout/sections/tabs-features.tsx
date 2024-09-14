"use client"
import {encode} from "qss"
import React, {useEffect, useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {motion} from "framer-motion"; // Import motion from framer-motion
import Image from "next/image";
import roadmap from "@/public/illustrations/roadmap.png"
import timeline from "@/public/illustrations/timeline.png"
import kanban from "@/public/illustrations/kanban.png"

export const imgWidth = 400;
export const imgHeight = 250;

const tabContent = {
    project: {
        title: "Project Profiles",
        image: <Image // dynamically pull page preview if thumbnail is not available
            src={`https://api.microlink.io/?${encode({
                url: "https://comend-refresh-sprint-3.vercel.app/pag/project/Gene%20Therapy%20for%20Rett%20Syndrome/overview",
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
            layout={"fixed"}
            priority={true}
            className="rounded-lg"
            alt="preview image"
            fill
        />,
        description: "Control the narrative and show patients, donors, researchers, and other stakeholders what you're working on.",
    },
    roadmap: {
        title: "Roadmap Planning",
        image: <Image // dynamically pull page preview if thumbnail is not available
            src={roadmap}
            quality={100}
            layout={"fixed"}
            priority={true}
            className="rounded-lg"
            alt="preview image"
            fill
        />,
        description: "AI powered roadmapping tools to make it easy for you to find the best path to the most effective treatments.",
    },
    timelines: {
        title: "Timeline Organization",
        image: <Image // dynamically pull page preview if thumbnail is not available
            src={timeline}
            quality={100}
            layout={"fixed"}
            priority={true}
            className="rounded-lg"
            alt="preview image"
            fill
        />,
        description: "Align your team on objective timelines and stay productive towards milestones.",
    },
    kanban: {
        title: "Project Management",
        image: <Image // dynamically pull page preview if thumbnail is not available
            src={kanban}
            quality={100}
            layout={"fixed"}
            priority={true}
            className="rounded-lg"
            alt="preview image"
            fill
        />,
        description: "Connect with patient advocacy groups for better outcomes.",
    },
};

export default function TabsFeaturesSection() {
    const [activeTab, setActiveTab] = useState('project');
    const tabs = ['project', 'roadmap', 'timelines', 'kanban'];
    const tabDuration = 8;

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTab(prev => {
                const currentIndex = tabs.indexOf(prev);
                const nextIndex = (currentIndex + 1) % tabs.length;
                return tabs[nextIndex] as string;
            });
        }, tabDuration * 1000);

        return () => clearInterval(interval);
    }, [activeTab]);

    const handleTabChange = (newValue: string) => {
        setActiveTab(newValue);
    };

    return (
        <section id="benefits" className="container py-24 sm:py-32 space-y-8">
            <div className="grid grid-cols-2">
                <div>
                    <h2 className="text-lg text-primary mb-2 tracking-wider">Platform</h2>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        The all-in-one platform for collaboration
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        RareSearch streamlines your efforts in the rare disease community. Manage projects, apply for
                        grants, collaborate with researchers, connect with advocacy groups, and hire contractors—all
                        from one intuitive platform.
                    </p>
                </div>
            </div>
            <Tabs value={activeTab} onValueChange={handleTabChange as any} className="flex flex-col space-y-8">
                {/* Only render the active tab content */}
                {tabs.map((tab) => (
                    activeTab === tab && (
                        <TabsContent key={tab} value={tab}
                                     className="flex justify-center items-center w-full max-w-7xl mx-auto bg-gradient-to-b p-8 from-80% from-[#1E3A8A] to-[#5AC1CF] to-100% rounded-lg">
                            <div className="relative w-[800px] h-[500px] max-w-7xl rounded-lg">
                                {tabContent[tab as keyof typeof tabContent].image}
                            </div>
                        </TabsContent>
                    )
                ))}
                <TabsList
                    className="grid grid-cols-4 items-start justify-start bg-transparent border-none shadow-none h-min">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab}
                            className="flex flex-col items-start space-y-8 relative bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            {/* Gray bar for each tab */}
                            <div className="relative w-full h-0.5 bg-gray-300">
                                {/* Blue animated bar for the active tab */}
                                {activeTab === tab && (
                                    <motion.div
                                        className="absolute top-0 left-0 h-full bg-sky-500"
                                        initial={{width: 0}}
                                        animate={{width: "100%"}}
                                        transition={{
                                            duration: tabDuration,
                                            ease: "linear"
                                        }}
                                    />
                                )}
                            </div>

                            <div className="flex flex-col items-start text-wrap text-start space-y-8 mt-4">
                                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                    {tabContent[tab as keyof typeof tabContent].title}
                                </h3>
                                <p className="text-base">
                                    {tabContent[tab as keyof typeof tabContent].description}
                                </p>
                            </div>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </section>
    )
}
