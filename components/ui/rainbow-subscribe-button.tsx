"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    "h-10 px-4 py-2" // Default size for balanced padding and height
);

interface RainbowSubscribeButtonProps {
    buttonTextColor?: string;
    subscribeStatus: boolean;
    initialText: React.ReactElement | string;
    changeText: React.ReactElement | string;
}

export const RainbowSubscribeButton: React.FC<RainbowSubscribeButtonProps> = ({
                                                                                  subscribeStatus,
                                                                                  buttonTextColor,
                                                                                  changeText,
                                                                                  initialText,
                                                                              }) => {
    const [isSubscribed, setIsSubscribed] = useState<boolean>(subscribeStatus);

    // Reset subscription state on page load or refresh
    useEffect(() => {
        setIsSubscribed(subscribeStatus);
    }, [subscribeStatus]);

    return (
        <AnimatePresence mode="wait">
            {isSubscribed ? (
                <motion.button
                    className={cn(
                        buttonVariants,
                        "relative w-[200px] overflow-hidden rounded-md bg-white text-black cursor-pointer border border-black", // Add border for visibility

                        // Before styles for the animated glow
                        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-2/5 before:w-4/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]"
                    )}
                    onClick={() => null} // Disable click action
                    disabled={true} // Disable the button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.span
                        key="action"
                        className="relative block h-full w-full font-semibold text-center"
                        initial={{ y: -50 }}
                        animate={{ y: 0 }}
                        style={{ color: "black" }}
                    >
                        {changeText}
                    </motion.span>
                </motion.button>
            ) : (
                <motion.button
                    className={cn(
                        buttonVariants,
                        "relative w-[200px] overflow-hidden rounded-md bg-black text-white cursor-pointer border border-black", // Add border for visibility

                        // Before styles for the animated glow
                        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-2/5 before:w-4/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]"
                    )}
                    style={{ color: buttonTextColor || "white" }}
                    onClick={() => setIsSubscribed(true)} // Set to true on click
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.span
                        key="reaction"
                        className="relative block font-semibold text-center"
                        initial={{ x: 0 }}
                        exit={{ x: 50, transition: { duration: 0.1 } }}
                    >
                        {initialText}
                    </motion.span>
                </motion.button>
            )}
        </AnimatePresence>
    );
};
