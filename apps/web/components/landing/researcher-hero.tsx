"use client";

import Balancer from "react-wrap-balancer";
import {Button} from "@comend/components/ui/button";
import {Badge} from "@comend/components/ui/badge";
import {motion} from "framer-motion";
import marketplace from "@/public/screenshots/marketplace.png"
import Image from "next/image";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {ArrowRight} from "lucide-react";

export const ResearcherHero = () => {
    const router = useRouter();
    return (
        <div className="flex flex-col max-w-7xl mx-auto min-h-screen pt-20 md:pt-40 relative overflow-hidden">
            <motion.h1
                initial={{
                    y: 40,
                    opacity: 0,
                }}
                animate={{
                    y: 0,
                    opacity: 1,
                }}
                transition={{
                    ease: "easeOut",
                    duration: 0.5,
                }}
                className="mx-auto text-center max-w-screen-lg text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-700 dark:text-white leading-relaxed lg:leading-snug"
            >
                <Balancer>
                    Systematically identify opportunities for research
                </Balancer>
            </motion.h1>
            <motion.p
                initial={{
                    y: 40,
                    opacity: 0,
                }}
                animate={{
                    y: 0,
                    opacity: 1,
                }}
                transition={{
                    ease: "easeOut",
                    duration: 0.5,
                    delay: 0.2,
                }}
                className="mx-auto text-center max-w-screen-sm text-2xl"
            >
                <Balancer>
                    Patient foundations, research tools, and grants all in one place.
                </Balancer>
            </motion.p>
            <motion.div
                initial={{
                    y: 80,
                    opacity: 0,
                }}
                animate={{
                    y: 0,
                    opacity: 1,
                }}
                transition={{
                    ease: "easeOut",
                    duration: 0.5,
                    delay: 0.4,
                }}
                className="flex items-center gap-4 justify-center mt-6 relative z-10"
            >
                <Button
                    variant="cta"
                    className="w-fit text-base"
                >
                    Sign in
                </Button>
            </motion.div>
            <div
                className="m-4 p-4 border border-neutral-200 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 rounded-[32px] mt-20 relative">
                <div
                    className="absolute inset-x-0 bottom-0 h-40 w-full bg-gradient-to-b from-transparent via-white to-white dark:via-black/50 dark:to-black scale-[1.1] pointer-events-none"/>
                <div
                    className="p-2 bg-white dark:bg-black dark:border-neutral-700 border border-neutral-200 rounded-[24px]">
                    <Image
                        src={marketplace}
                        alt="Researcher hub screenshot"
                        width={1920}
                        height={1080}
                        className="rounded-[20px]"
                    />
                </div>
            </div>
        </div>
    );
};
