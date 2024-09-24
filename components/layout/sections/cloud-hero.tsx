"use client";
import {
    HeroHighlight,
    Highlight,
} from "@/components/layout/sections/hero-highlight";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Label } from "@/components/ui/label";
import { FancyInput } from "@/components/ui/fancy-input";
import React, {useEffect, useRef, useState} from "react";
import { LabelInputContainer } from "@/components/contact-form";
import { RainbowSubscribeButton } from "@/components/ui/rainbow-subscribe-button";
import {LinkPreview} from "@/components/link-preview";
import Image from "next/image";
import librareyLogo from "@/public/logos/librarey-logo.svg";
import scimanticLogo from "@/public/logos/scimantic-logo.png";

const bubbles = [
    { title: "Full Stack Developers", href: "#" },
    { title: "Node JS Developers", href: "#" },
    { title: "React Developers", href: "#" },
    { title: "Blockchain Developers", href: "#" },
    { title: "Cyber Security", href: "#" },
    { title: "Typescript Development", href: "#" },
    { title: "AI in Production", href: "#" },
    { title: "Python Developers", href: "#" },
    { title: "DevOps Engineers", href: "#" },
    { title: "Machine Learning Engineers", href: "#" },
    { title: "Data Scientists", href: "#" },
    { title: "Front-end Developers", href: "#" },
    { title: "Backend Developers", href: "#" },
    { title: "Mobile App Developers", href: "#" },
    { title: "UI/UX Designers", href: "#" },
    { title: "Cloud Architects", href: "#" },
    { title: "Database Administrators", href: "#" },
    { title: "Site Reliability Engineers", href: "#" },
    { title: "Game Developers", href: "#" },
    { title: "Product Managers", href: "#" },
];

export const CloudHeroSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null); // Ref for hero section
    const [isHeroInView, setIsHeroInView] = useState(false); // State to track if hero is in view
    const [centerX, setCenterX] = useState(0);
    const [centerY, setCenterY] = useState(0);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const baseRadiusX = 500;
    const baseRadiusY = 100;
    const bubbleRadius = 40;
    const minDistance = bubbleRadius * 2;

    const areBubblesTooClose = (bubble1: { x: number; y: number }, bubble2: { x: any; y: any }) => {
        const dx = bubble1.x - bubble2.x;
        const dy = bubble1.y - bubble2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < minDistance;
    };

    const cloudPositions: any[] = [];

    bubbles.forEach((_, index) => {
        let x: number = 0;
        let y: number = 0;
        let isValidPosition = false;
        let attempts = 0;
        const maxAttempts = 100;

        // Define container boundaries
        const containerWidth = containerRef.current?.offsetWidth || 1000;
        const containerHeight = containerRef.current?.offsetHeight || 600;

        // Define the reduced width and height to limit the spread
        const spreadFactorX = 0.8; // 70% of the container's width
        const spreadFactorY = 0.8; // 70% of the container's height

        // Set margins from the edges of the container
        const marginX = (containerWidth * (1 - spreadFactorX)) / 2;
        const marginY = (containerHeight * (1 - spreadFactorY)) / 2;

        while (!isValidPosition && attempts < maxAttempts) {
            attempts += 1;

            // Generate a position within the reduced width and height, biased toward edges
            const isHorizontalEdge = Math.random() < 0.5;

            if (isHorizontalEdge) {
                // Random x position within the reduced width, more focused near edges
                x = Math.random() < 0.5
                    ? marginX + Math.random() * (containerWidth * 0.2) // Left side
                    : containerWidth - marginX - Math.random() * (containerWidth * 0.2); // Right side
                // Random y position within the entire height
                y = marginY + Math.random() * (containerHeight * spreadFactorY);
            } else {
                // Random y position within the reduced height, more focused near edges
                y = Math.random() < 0.5
                    ? marginY + Math.random() * (containerHeight * 0.2) // Top side
                    : containerHeight - marginY - Math.random() * (containerHeight * 0.2); // Bottom side
                // Random x position within the entire width
                x = marginX + Math.random() * (containerWidth * spreadFactorX);
            }

            x -= 100 // move a little left

            isValidPosition = !cloudPositions.some((bubble) =>
                areBubblesTooClose(bubble, { x, y })
            );
        }

        cloudPositions.push({ x, y });
    })

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mouseX.set(event.clientX);
            mouseY.set(event.clientY);
        };

        const updateCenter = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setCenterX(rect.width / 2 - 70);
                setCenterY(rect.height / 2);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", updateCenter);

        updateCenter(); // Initial center calculation after mount

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", updateCenter);
        };
    }, [mouseX, mouseY]);

    // Intersection Observer logic
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setIsHeroInView(entry.isIntersecting); // Set state when hero content is in view
            },
            { threshold: 0.5 } // Adjust threshold to when the hero is 50% in view
        );

        if (heroRef.current) {
            observer.observe(heroRef.current);
        }

        return () => {
            if (heroRef.current) {
                observer.unobserve(heroRef.current);
            }
        };
    }, []);

    const calculateMovement = (bubbleX: number, bubbleY: number) => {
        const distX = useSpring(mouseX, {
            stiffness: 100,
            damping: 20,
            mass: 0.3,
        });
        const distY = useSpring(mouseY, {
            stiffness: 100,
            damping: 20,
            mass: 0.3,
        });

        const x = useTransform(distX, (val) => val / 30 + bubbleX);
        const y = useTransform(distY, (val) => val / 30 + bubbleY);

        return { x, y };
    };

    return (
        <section className="relative container w-full mx-auto">
            {/* Hero section with a ref to observe visibility */}
            <div ref={heroRef}
                 className="bg-gradient-to-r from-transparent via-white to-transparent relative z-10 flex flex-col h-1/2 justify-center items-center text-center max-w-7xl gap-8 mx-auto py-24 md:py-24 mt-16"
            >
                <motion.div
                    initial={{opacity: 0, y: 50}} // More pronounced drop effect
                    animate={{opacity: 1, y: [50, -10, 0]}}
                    transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
                    className="hidden sm:mt-8 sm:flex lg:mt-8"
                >
                    <div
                        className="bg-white inline-flex items-center rounded-full px-3 py-1 text-base leading-6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                        From the creators of
                        <LinkPreview
                            url={"https://www.librarey.com/"}
                            className="hover:underline inline-flex items-center mx-2 gap-x-1"
                            target="_blank"
                        >
                            <Image src={librareyLogo} alt="" className="self-center w-8 h-8"/>
                            Librarey
                        </LinkPreview>
                        and
                        <LinkPreview
                            url={"https://scimantic.com/"}
                            className="hover:underline inline-flex items-center mx-2 gap-x-1"
                            target="_blank"
                        >
                            <Image src={scimanticLogo} alt="" className="self-center w-6 h-6"/>
                            Scimantic
                        </LinkPreview>
                    </div>
                </motion.div>

                <HeroHighlight>
                    <motion.h1
                        initial={{opacity: 0, y: 50}}
                        animate={{opacity: 1, y: [50, -10, 0]}}
                        transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
                        className="max-w-screen-md text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-700 dark:text-white leading-relaxed lg:leading-snug"
                    >
                        Where patient groups
                        <Highlight className="text-black dark:text-white">drive research</Highlight>
                    </motion.h1>
                </HeroHighlight>

                <motion.p
                    initial={{opacity: 0, y: 50}}
                    animate={{opacity: 1, y: [50, -10, 0]}}
                    transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
                    className="max-w-screen-sm text-xl text-muted-foreground"
                >
                    {`Design your research roadmap. Connect with academics, CROs, and other patient groups who can help.`}
                </motion.p>

                <motion.div
                    initial={{opacity: 0, y: 50}}
                    animate={{opacity: 1, y: [50, -10, 0]}}
                    transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
                    className="flex flex-row space-x-2"
                >
                    <div className="text-center w-full flex flex-col justify-center items-center space-y-2">
                        <Label className="text-base">🎉&nbsp;&nbsp;Become a beta tester</Label>
                        <div className="w-full flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                            <LabelInputContainer>
                                <FancyInput id="name" placeholder="Name" type="text"/>
                            </LabelInputContainer>
                            <LabelInputContainer>
                                <FancyInput id="email" placeholder="Email" type="email"/>
                            </LabelInputContainer>
                        </div>
                        <RainbowSubscribeButton
                            subscribeStatus={false}
                            initialText="Join"
                            changeText="Joined"
                            buttonTextColor="white"
                        />
                    </div>
                </motion.div>

            </div>

            {/* Render bubbles whether or not the hero is in view, but hide them until hero is in view */}
            <motion.div
                initial={{opacity: 0, y: 50}}
                animate={{opacity: 1, y: [50, -10, 0]}}
                transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
                className="hidden sm:block absolute inset-0 z-0 pointer-events-none opacity-80" ref={containerRef}
            >
                {bubbles.map((bubble, index) => {
                    const {x, y} = calculateMovement(cloudPositions[index].x, cloudPositions[index].y);

                    return (
                        <motion.a
                            key={index}
                            href={bubble.href}
                            className="absolute bg-white text-black shadow-lg p-4 rounded-full border border-gray-200 hover:z-50 pointer-events-auto"
                            style={{x, y, zIndex: -1, opacity: isHeroInView ? 1 : 0}} // Control visibility here
                            whileHover={{scale: 1.4}} // Increased scale on hover
                            whileTap={{scale: 0.8}} // More exaggerated tap feedback
                            transition={{type: "spring", stiffness: 100, damping: 15}} // Stronger spring effect
                        >
                            {bubble.title}
                        </motion.a>
                    );
                })}
            </motion.div>
        </section>
    );
};