"use client";
import {cn} from "@/lib/utils";
import React, {useRef} from "react";
import {motion, useInView, useSpring, useTransform} from "framer-motion";
import {useEffect} from "react";

export function StatsSection() {
    const items = [
        {
            description: "Grants",
            value: 100,
        },
        {
            description: "Contractors",
            value: 500,
        },
        {
            description: "Researchers",
            value: 5000,
        },
    ];

    return (
        <section
            className="group/container relative mx-auto w-full max-w-7xl px-8 overflow-hidden rounded-3xl py-24"
            aria-labelledby="stats-heading"
        >
            <div className="flex flex-col justify-center items-center relative z-20 space-y-8">
                {/* Title Section */}
                <div className="flex flex-col justify-center items-center md:w-1/2 mx-auto text-center">
                    <div>
                        <h2 id="stats-heading" className="text-lg text-primary mb-2 tracking-wider">
                            {`Marketplace`}
                        </h2>

                        <h3 className="text-3xl md:text-4xl font-bold mb-4">
                            {`Everything you need in one place`}
                        </h3>
                        <p className="text-xl text-muted-foreground mb-8">
                            {`We connect opportunities, people, and organizations to help you find the best partners and advance treatments.`}
                        </p>
                    </div>
                </div>

                {/* Stats Section */}
                <div
                    className="flex flex-col sm:flex-row justify-center mx-auto max-w-7xl space-y-6 sm:space-y-0 sm:space-x-4 lg:space-x-8"
                    role="list"
                    aria-label="Statistics"
                >
                    {items.map((item, index) => (
                        <motion.div
                            initial={{
                                y: 20,
                                opacity: 0,
                                filter: "blur(4px)",
                            }}
                            animate={{
                                y: 0,
                                opacity: 1,
                                filter: "blur(0px)",
                            }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                            }}
                            key={"card" + index}
                            className={cn(
                                "flex flex-col justify-center items-center group/card p-4 sm:p-6 lg:p-8 space-y-2 relative overflow-hidden rounded-lg"
                            )}
                            role="listitem"
                            aria-labelledby={`stat-${index}-title`}
                            aria-describedby={`stat-${index}-description`}
                        >
                            <div className="flex flex-col justify-center items-center gap-2 text-center">
                                <p
                                    id={`stat-${index}-title`}
                                    className="text-3xl md:text-4xl font-bold text-neutral-700 dark:text-neutral-200 font-mono"
                                >
                                    <AnimatedNumber value={item.value} /> +
                                </p>
                            </div>
                            <p
                                id={`stat-${index}-description`}
                                className="text-balance text-base sm:text-lg lg:text-xl text-neutral-600 dark:text-neutral-300"
                            >
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function AnimatedNumber({
                            value,
                            initial = 0,
                        }: {
    value: number;
    initial?: number;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref);

    const spring = useSpring(initial, {mass: 0.8, stiffness: 75, damping: 15});
    const display = useTransform(spring, (current) =>
        Math.round(current).toLocaleString(),
    );

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        } else {
            spring.set(initial);
        }
    }, [isInView, spring, value, initial]);

    return <motion.span ref={ref}>{display}</motion.span>;
}
