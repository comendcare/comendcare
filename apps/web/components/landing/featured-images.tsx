"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    motion,
    useInView,
    useTransform,
    AnimatePresence,
    useMotionValue,
    useSpring,
    animate,
    stagger,
} from "framer-motion";
import { cn } from "@comend/lib/utils";

export const testimonials = [
    {
        name: "The Rory Belle Foundation",
        image:
            "https://storage.googleapis.com/comend-app-public/1742928808690-Screenshot%202025-03-25%20at%2010.10.42%E2%80%AFAM.png",
        url: "https://rbf.comend.io/",
    },
    {
        name: "United Leukodystrophy Foundation",
        image:
            "https://storage.googleapis.com/comend-app-public/1742916900035-Screenshot%202025-03-25%20at%2010.34.24%E2%80%AFAM.png",
        url: "https://ulf.comend.io/",
    },
    {
        name: "Aicardi-Goutieres Syndrome Foundation",
        image:
            "https://storage.googleapis.com/comend-app-public/1737992929599-logo.png",
        url: "https://agsaa.comend.io/",
    },
    // {
    //     name: "CTNNB1",
    //     image:
    //         "https://storage.googleapis.com/comend-app-public/1746723228258-CTNNB1.png",
    //     url: "https://www.ctnnb1.org",
    // },
    {
        name: "SMOC1 Foundation for Hope",
        image:
            "https://storage.googleapis.com/comend-app-public/1741885287779-Screenshot%202025-03-13%20at%201.00.16%E2%80%AFPM.png",
        url: "https://smoc1.comend.io/",
    },
    {
        name: "Project 8p",
        image:
            "https://storage.googleapis.com/comend-app-public/1742234988826-Project%208p%20Logo.jpg",
        url: "https://project8p.comend.io/",
    },
];

export const FeaturedImages = ({
                                   textClassName,
                                   className,
                                   showStars = false,
                                   containerClassName,
                               }: {
    textClassName?: string;
    className?: string;
    showStars?: boolean;
    containerClassName?: string;
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const springConfig = { stiffness: 100, damping: 5 };
    const x = useMotionValue(0);
    const translateX = useSpring(
        useTransform(x, [-100, 100], [-50, 50]),
        springConfig,
    );

    const handleMouseMove = (event: any) => {
        const halfWidth = event.target.offsetWidth / 2;
        x.set(event.nativeEvent.offsetX - halfWidth);
    };

    const containerRef = React.useRef(null);
    const isInView = useInView(containerRef, { once: true });

    useEffect(() => {
        if (isInView) {
            animate(
                ".animation-container",
                { scale: [1.1, 1, 0.9, 1], opacity: [0, 1] },
                { duration: 0.4, delay: stagger(0.1) },
            );
        }
    }, [isInView]);

    return (
        <div
            ref={containerRef}
            className={cn("mb-10 mt-10 flex flex-col", containerClassName)}
        >
            <div
                className={cn(
                    "mb-2 flex flex-col sm:flex-row",
                    className,
                )}
            >
                <div className="mb-4 flex flex-row items-center sm:mb-0">
                    {testimonials.map((testimonial, idx) => (
                        <div
                            className="group relative -mr-4"
                            key={testimonial.name}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <AnimatePresence>
                                {hoveredIndex === idx && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.6 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                            transition: {
                                                type: "spring",
                                                stiffness: 160,
                                                damping: 20,
                                            },
                                        }}
                                        exit={{ opacity: 0, y: 20, scale: 0.6 }}
                                        style={{ translateX: translateX, whiteSpace: "nowrap" }}
                                        className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-xs shadow-xl"
                                    >
                                        <div className="absolute inset-x-0 -bottom-px z-30 mx-auto h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                                        <div className="absolute inset-x-0 -bottom-px z-30 mx-auto h-px w-[70%] bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                                        <div className="flex items-center gap-2">
                                            <div className="relative z-30 text-sm font-bold text-white">
                                                {testimonial.name}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="animation-container">
                                <a href={testimonial.url} target="_blank" rel="noopener noreferrer">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{
                                            rotate: `${Math.random() * 15 - 5}deg`,
                                            scale: 1,
                                            opacity: 1,
                                        }}
                                        whileHover={{ scale: 1.05, zIndex: 30 }}
                                        transition={{ duration: 0.2 }}
                                        className="relative overflow-hidden rounded-2xl border-2 border-neutral-200"
                                    >
                                        <Image
                                            onMouseMove={handleMouseMove}
                                            height={100}
                                            width={100}
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="h-14 w-14 object-cover object-top"
                                        />
                                    </motion.div>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            <p className="mt-4 text-balance text-base text-neutral-600 dark:text-neutral-300">
                Build with the support of rare disease groups.
            </p>
        </div>
    );
};
