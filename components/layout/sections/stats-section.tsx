"use client";
import {cn} from "@/lib/utils";
import React, {useRef} from "react";
import {motion, useInView, useSpring, useTransform} from "framer-motion";
import {useEffect} from "react";

export function StatsSection() {
    const items = [
        {
            description: "Grants",
            value: 250,
        },
        {
            description: "Contractors",
            value: 1000,
        },
        {
            description: "Researchers",
            value: 10000,
        }
    ];
    return (
        <section className="group/container relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl py-24">
            <div className="flex flex-col justify-center items-center relative z-20 space-y-8">
                {/*<div className="grid grid-cols-2">*/}
                <div className="flex flex-col justify-center items-center w-1/2 mx-auto text-center">
                    <div>
                        <h2 className="text-lg text-primary mb-2 tracking-wider">Marketplace</h2>

                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Everything you need in one place
                        </h2>
                        <p className="text-xl text-muted-foreground mb-8">
                            We connect opportunities, people, and organizations to help you find the best partners and advance treatments.
                        </p>
                    </div>
                </div>
                {/*<div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">*/}
                <div className="flex flex-col sm:flex-row mx-auto max-w-7xl space-x-16">
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
                            className={cn("flex flex-col justify-center items-center group/card space-y-2 relative overflow-hidden rounded-lg")}
                        >
                            <div className="flex items-center gap-2">
                                <p className="text-3xl sm:text-6xl font-bold text-neutral-700 dark:text-neutral-200">
                                    <AnimatedNumber value={item.value}/> +
                                </p>
                            </div>
                            <p className="text-balance text-base text-neutral-600 dark:text-neutral-300">
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
