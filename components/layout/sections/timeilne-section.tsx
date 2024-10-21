"use client";
import {cn} from "@/lib/utils";
import Image from "next/image";
import React, {useRef, useState} from "react";
import {AnimatePresence, motion, useMotionValue} from "framer-motion";
import NORDTeam from "@/public/team/nord-team.jpeg";
import NYTeam from "@/public/team/ny-team.jpeg"
import SDTeam from "@/public/team/sd-team.jpg"
import TorontoTeam from "@/public/team/toronto-team.jpg"

export function TimelineSection() {
    const timeline = [
        {
            title: "March 2023",
            content: (
                <div className="flex flex-col">
                    <h2 className="mt-8 text-xl font-bold text-neutral-600 dark:text-neutral-300 md:text-3xl">
                        Comend is founded
                    </h2>
                    <p className="mb-8 mt-4 text-neutral-600 text-xl dark:text-neutral-300">
                        Flawnson and Albert re-united to address broken processes in translational research after working in drug discovery and biomedical engineering.
                    </p>
                    <Image
                        src={SDTeam}
                        height="2000"
                        width="2000"
                        className="w-full rounded-xl object-cover object-left-top md:rounded-3xl"
                        alt="Startup template image"
                        fetchPriority="high"
                    />
                </div>
            ),
        },
        {
            title: "July 2023",
            content: (
                <div className="flex flex-col">
                    <h2 className="mt-8 text-xl font-bold text-neutral-600 dark:text-neutral-300 md:text-3xl">
                        Librarey is born
                    </h2>
                    <p className="mb-8 mt-4 text-neutral-600 text-xl dark:text-neutral-300">
                        With the support of Character Labs, we focused on co-designing solutions with and for rare families. That’s when we met Sierra and partnered to build Librarey which launched in the fall.
                    </p>
                    <Image
                        src={NORDTeam}
                        height="2000"
                        width="2000"
                        className="w-full rounded-xl object-cover object-left-top md:rounded-3xl"
                        alt="Startup template image"
                        fetchPriority="high"
                    />
                </div>
            ),
        },
        {
            title: "February 2024",
            content: (
                <div className="flex flex-col">
                    <h2 className="mt-8 text-xl font-bold text-neutral-600 dark:text-neutral-300 md:text-3xl">
                        The team grows
                    </h2>
                    <p className="mb-8 mt-4 text-neutral-600 text-xl dark:text-neutral-300">
                        After partnering with NEXT AI and Drive Capital, our team grew with kindred spirits including Pepi, Betty, Megan, and more.
                    </p>
                    <Image
                        src={NYTeam}
                        height="2000"
                        width="2000"
                        className="w-full rounded-xl object-cover object-left-top md:rounded-3xl"
                        alt="Startup template image"
                        fetchPriority="high"
                    />
                </div>
            ),
        },
        {
            title: "July 2024",
            content: (
                <div className="flex flex-col">
                    <h2 className="mt-8 text-xl font-bold text-neutral-600 dark:text-neutral-300 md:text-3xl">
                        We commit
                    </h2>
                    <p className="mb-8 mt-4 text-neutral-600 text-xl dark:text-neutral-300">
                        We're curreAfter 16 months of boots-on-the-ground research and testing, we pick one of countless ideas to commit our resources to.ntly working with several patient groups to build a new scientific communicator and research platform.
                    </p>
                    <Image
                        src={TorontoTeam}
                        height="2000"
                        width="2000"
                        className="w-full rounded-xl object-cover object-left-top md:rounded-3xl"
                        alt="Startup template image"
                        fetchPriority="high"
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="w-full">
            <StatsForChangelogDesktop stats={timeline}/>
            <StatsForChangelogMobile stats={timeline}/>
        </div>
    );
}

type Stats = {
    title: string;
    content: React.ReactNode;
};

export const StatsForChangelogMobile = ({stats}: { stats: Stats[] }) => {
    return (
        <section className="relative container w-full mx-auto">
            {/* <div className="mx-auto block w-full max-w-7xl px-4 md:px-8 lg:hidden"> */}
            <div className="block lg:hidden max-w-7xl gap-8 px-4 md:px-8 py-16 md:py-24 mt-16">
                <h2 className="text-center text-2xl md:text-5xl font-bold pb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-600">
                    {`We’re working to empower a patient-led future for research and development.`}
                </h2>
                <p className="text-center text-base text-neutral-7000 font-sans dark:text-neutral-300 mt-4 mb-10">
                    {`We believe that advancing new treatments begins by empowering patient groups, whose grassroots efforts are essential in advocating for the needs of patients.`}
                </p>
                {stats.map((stat, index) => (
                    <div
                        className="mb-10 flex flex-col gap-4"
                        key={`stat-tab-mobile-${index}`}
                    >
                        <div
                            className={cn(
                                "flex items-center rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800",
                            )}
                        >
                            <span className="mr-4 flex-shrink-0 font-medium text-neutral-700 dark:text-neutral-100">
                                {stat.title}
                            </span>
                            <div className="flex w-full items-center gap-2">
                                <div
                                    className="h-1 w-1 flex-shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
                                <div className="h-px w-full bg-neutral-300 dark:bg-neutral-700"></div>
                                <div
                                    className="h-1 w-1 flex-shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
                            </div>
                        </div>
                        {stat.content}
                    </div>
                ))}
            </div>
        </section>
    );
};

export const StatsForChangelogDesktop = ({stats}: { stats: Stats[] }) => {
    const [active, setActive] = useState(stats[0]);
    const direction = useMotionValue(0);

    const isActive = (stat: (typeof stats)[number]) =>
        stat.title === active.title;

    const handleSetActive = (stat: (typeof stats)[number]) => {
        const currentIndex = stats.findIndex((s) => s.title === active.title);
        const newIndex = stats.findIndex((s) => s.title === stat.title);
        direction.set(newIndex > currentIndex ? 1 : -1);
        setActive(stat);
    };

    return (
        <section className="relative container w-full mx-auto">
            <div className="hidden lg:grid max-w-7xl gap-8 mx-auto py-16 md:py-24 mt-16">
                <h2 className="text-center text-2xl md:text-5xl font-bold pb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-600">
                    {`We’re working to empower a patient-led future for research and development.`}
                </h2>
                <p className="text-center text-base text-neutral-7000 font-sans dark:text-neutral-300 mt-4 mb-10">
                    {`We believe that advancing new treatments begins by empowering patient groups, whose grassroots efforts are essential in advocating for the needs of patients.`}
                </p>
                <div className="grid w-full grid-cols-4 gap-10">
                    {stats.map((stat, index) => (
                        <button
                            key={`stat-tab-${index}`}
                            onClick={() => handleSetActive(stat)}
                            className={cn(
                                "flex items-center rounded-2xl p-4 hover:bg-neutral-100 dark:hover:bg-neutral-800",

                                isActive(stat) ? "bg-neutral-100 dark:bg-neutral-800" : "",
                            )}
                        >
                            <span className="mr-4 flex-shrink-0 font-medium text-neutral-700 dark:text-neutral-100">
                                {stat.title}
                            </span>
                            <div className="flex w-full items-center gap-2">
                                <div
                                    className="h-1 w-1 flex-shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
                                <div className="h-px w-full bg-neutral-300 dark:bg-neutral-700"></div>
                                <div
                                    className="h-1 w-1 flex-shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
                            </div>
                        </button>
                    ))}
                </div>
                <div
                    className="relative mt-4 w-full overflow-hidden px-10 [mask-image:linear-gradient(to_right,transparent,white_2%,white_98%,transparent)]">
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                            key={String(active.title)}
                            initial={{
                                x: 1000,
                                opacity: 0,
                            }}
                            exit={{
                                x: -1000,
                                opacity: 0,
                            }}
                            animate={{
                                x: 0,
                                opacity: 1,
                            }}
                            transition={{
                                ease: "easeOut",
                            }}
                            className="w-full"
                        >
                            {active.content}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};
