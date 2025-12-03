"use client";

import Balancer from "react-wrap-balancer";
import {Button, buttonVariants} from "@comend/components/ui/button";
import {motion} from "framer-motion";
import rfpMarketplace from "@/public/screenshots/rfp-marketplace.png"
import Image from "next/image";
import {useSigninDropdown} from "@/state/signin/signin-drodown-context";
import Link from "next/link";

export const ResearcherHero = () => {
    const {setOpen} = useSigninDropdown()

    return (
        <div className="flex flex-col max-w-7xl mx-auto pt-20 md:pt-40 relative overflow-hidden">
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
                className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl mx-auto text-center max-w-screen-lg md:text-5xl lg:text-6xl dark:text-white leading-relaxed lg:leading-snug"
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
                className="mx-auto text-center max-w-screen-sm text-2xl mt-4"
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
                <Link
                    className={buttonVariants({variant: "cta"})}
                    href={
                        process.env.NEXT_PUBLIC_NODE_ENV === "production"
                            ? "https://researcher.comend.io/login"
                            : `http://researcher.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`
                    }
                >
                    Sign up
                </Link>
            </motion.div>
            <div
                className="m-4 p-4 border border-neutral-200 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 rounded-[32px] mt-20 relative">
                <div
                    className="hidden lg:block absolute inset-x-0 bottom-0 h-40 w-full bg-gradient-to-b from-transparent via-white to-white dark:via-black/50 dark:to-black scale-[1.1] pointer-events-none"/>
                <div
                    className="p-2 bg-white dark:bg-black dark:border-neutral-700 border border-neutral-200 rounded-[24px]">
                    <Image
                        src={rfpMarketplace}
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
