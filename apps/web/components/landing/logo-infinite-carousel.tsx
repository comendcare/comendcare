"use client";
import {useMemo} from "react";
import {motion, useReducedMotion} from "framer-motion";

export const testimonials = [
    {
        name: "The Rory Belle Foundation",
        image:
            "https://storage.googleapis.com/comend-app-public/1742928808690-Screenshot%202025-03-25%20at%2010.10.42%E2%80%AFAM.png",
        url: "https://rbf.comend.io/",
    },
    {
        name: "Aicardi-Goutieres Syndrome Foundation",
        image: "https://storage.googleapis.com/comend-app-public/1737992929599-logo.png",
        url: "https://agsaa.comend.io/",
    },
    {
        name: "CurePDE",
        image:
            "https://storage.googleapis.com/comend-app-public/1749575307892-Screenshot-2025-06-10-at-12.08.13-PM.png",
        url: "https://curepde.comend.io/",
    },
    // {
    //     name: "L-CMD Research Foundation",
    //     image: "https://pbs.twimg.com/profile_images/1357498726332383238/fiGwwQNM_400x400.jpg",
    //     url: "https://lcmd.comend.io/",
    // },
    {
        name: "PBD Project",
        image:
            "https://storage.googleapis.com/comend-app-public/1746629308312-PBD%20Project%20Logo.png",
        url: "https://pbdproject.comend.io/",
    },
    // {
    //     name: "United Leukodystrophy Foundation",
    //     image:
    //         "https://storage.googleapis.com/comend-app-public/1742916900035-Screenshot%202025-03-25%20at%2010.34.24%E2%80%AFAM.png",
    //     url: "https://ulf.comend.io/",
    // },
    // {
    //     name: "CTNNB1",
    //     image:
    //         "https://storage.googleapis.com/comend-app-public/1746723228258-CTNNB1.png",
    //     url: "https://www.ctnnb1.org",
    // },
    {
        name: "Project 8p",
        image:
            "https://storage.googleapis.com/comend-app-public/1742234988826-Project%208p%20Logo.jpg",
        url: "https://project8p.comend.io/",
    },
    {
        name: "Odylia Therapeutics",
        image:
            "https://storage.googleapis.com/comend-app-public/1745347709368-central.png",
        url: "https://odylia.comend.io/",
    },
];

// A single, seamlessly looping strip. We duplicate the content so that
// animating from 0% → -50% yields a continuous marquee.
function LogoStrip({speed = 30}: { speed?: number }) {
    const prefersReducedMotion = useReducedMotion();

    // Duplicate once for seamless loop
    const logos = useMemo(() => [...testimonials, ...testimonials], []);

    // If user prefers reduced motion, don't animate; allow manual scroll.
    if (prefersReducedMotion) {
        return (
            <div className="flex min-w-max gap-12 pr-12">
                {logos.map((logo, idx) => (
                    <a
                        key={`${logo.name}-${idx}`}
                        href={logo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                        aria-label={logo.name}
                    >
                        <img
                            alt={logo.name}
                            src={logo.image}
                            className="h-16 w-auto object-contain"
                            loading="lazy"
                            decoding="async"
                        />
                    </a>
                ))}
            </div>
        );
    }

    return (
        <motion.div
            className="flex min-w-max gap-12 pr-12"
            // Move the strip left by half its width (because content is duplicated once)
            // to create a perfect loop. Duration controls speed (smaller = faster).
            animate={{x: ["0%", "-50%"]}}
            transition={{ease: "linear", duration: speed, repeat: Infinity}}
            aria-hidden
        >
            {logos.map((logo, idx) => (
                <a
                    key={`${logo.name}-${idx}`}
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                    aria-label={logo.name}
                >
                    <img
                        alt={logo.name}
                        src={logo.image}
                        className="h-16 w-auto object-contain"
                        loading="lazy"
                        decoding="async"
                    />
                </a>
            ))}
        </motion.div>
    );
}

export default function LogoInfiniteCarousel() {
    return (
        <motion.section
            initial={{opacity: 0, y: 50}}
            animate={{opacity: 1, y: [50, -10, 0]}}
            transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
            className="overflow-hidden bg-white py-8 sm:py-16"
            aria-label="Supported by patient groups"
            role="region"
            itemScope
            itemType="https://schema.org/Organization"
        >
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
                {/* Marquee viewport */}
                <div className="relative overflow-hidden">
                    {/* Two mirrored strips for denser feel on large screens */}
                    <div
                        className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                        <div className="flex items-center">
                            <LogoStrip speed={30}/>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <p
                        className="relative rounded-full bg-gray-50 px-4 py-1.5 text-sm/6 text-gray-600 inset-ring inset-ring-gray-900/5 dark:bg-gray-800/75 dark:text-gray-400 dark:inset-ring-white/10"
                        aria-label="Support statement"
                    >
                            <span className="hidden md:inline">
                              Built with the support of 20+ patient groups.
                            </span>
                        {/* <a
                            href="/marketplace"
                            className="font-semibold text-blue-dark hover:text-blue-light dark:text-blue-400 dark:hover:text-blue-300 ml-2"
                        >
                            <span aria-hidden="true" className="absolute inset-0"/>
                            Browse all our patient groups
                            <span aria-hidden="true"> →</span>
                        </a> */}
                    </p>
                </div>
            </div>
        </motion.section>
    );
}
