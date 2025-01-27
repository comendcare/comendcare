"use client"
import {
    HeroHighlight,
    Highlight
} from "@/components/layout/sections/hero-highlight"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Label } from "@/components/ui/label"
import { FancyInput } from "@/components/ui/fancy-input"
import React, { useEffect, useRef, useState } from "react"
import { LabelInputContainer } from "@/components/contact-form"
import { LinkPreview } from "@/components/link-preview"
import Image from "next/image"
import librareyLogo from "@/public/logos/librarey-logo.svg"
import scimanticLogo from "@/public/logos/scimantic-logo.png"
import { BetaSignup } from "@/components/beta-signup"

const bubbles = [
    { title: "Patient groups", href: "#" },
    { title: "CROs", href: "#" },
    { title: "CDMOs", href: "#" },
    { title: "Biotechs", href: "#" },
    { title: "Pharma", href: "#" },
    // { title: "Labs", href: "#" },
    // { title: "PIs", href: "#" },
    // { title: "Post-docs", href: "#" },
    // { title: "Consultants", href: "#" },
    { title: "Grants", href: "#" },
    // { title: "Research agreements", href: "#" },
    // { title: "IP licenses", href: "#" },
    { title: "Animal models", href: "#" },
    { title: "Cell lines", href: "#" },
    { title: "Organoids", href: "#" },
    { title: "Registries", href: "#" },
    { title: "Natural history", href: "#" },
    { title: "Biomarkers", href: "#" },
    { title: "Biobanks", href: "#" },
    { title: "AAVs", href: "#" },
    // { title: "Nanoparticles", href: "#" },
    { title: "Gene editing", href: "#" },
    { title: "CRISPR", href: "#" },
    { title: "ASOs", href: "#" },
    { title: "RNA therapy", href: "#" },
    { title: "Prime editing", href: "#" },
    { title: "Epilepsy", href: "#" },
    { title: "Autism", href: "#" },
    { title: "Mitochondrial diseases", href: "#" },
    { title: "Neurodegeneration", href: "#" }
    // { title: "Lawyers", href: "#" },
    // { title: "Accountants", href: "#" },
    // { title: "Web designers", href: "#" },
]

export const CloudHeroSection = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const heroRef = useRef<HTMLDivElement>(null) // Ref for hero section
    const [isHeroInView, setIsHeroInView] = useState(false) // State to track if hero is in view
    const [centerX, setCenterX] = useState(0)
    const [centerY, setCenterY] = useState(0)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const baseRadiusX = 500
    const baseRadiusY = 100
    const bubbleRadius = 40
    const minDistance = bubbleRadius * 2

    const areBubblesTooClose = (
        bubble1: { x: number; y: number },
        bubble2: { x: any; y: any }
    ) => {
        const dx = bubble1.x - bubble2.x
        const dy = bubble1.y - bubble2.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < minDistance
    }

    const cloudPositions: any[] = []

    bubbles.forEach((_, index) => {
        let x: number = 0
        let y: number = 0
        let isValidPosition = false
        let attempts = 0
        const maxAttempts = 100

        // Define container boundaries
        const containerWidth = containerRef.current?.offsetWidth || 1000
        const containerHeight = containerRef.current?.offsetHeight || 600

        // Define the reduced width and height to limit the spread
        const spreadFactorX = 0.8 // 70% of the container's width
        const spreadFactorY = 0.8 // 70% of the container's height

        // Set margins from the edges of the container
        const marginX = (containerWidth * (1 - spreadFactorX)) / 2
        const marginY = (containerHeight * (1 - spreadFactorY)) / 2

        while (!isValidPosition && attempts < maxAttempts) {
            attempts += 1

            // Generate a position within the reduced width and height, biased toward edges
            const isHorizontalEdge = Math.random() < 0.5

            if (isHorizontalEdge) {
                // Random x position within the reduced width, more focused near edges
                x =
                    Math.random() < 0.5
                        ? marginX + Math.random() * (containerWidth * 0.2) // Left side
                        : containerWidth -
                          marginX -
                          Math.random() * (containerWidth * 0.2) // Right side
                // Random y position within the entire height
                y = marginY + Math.random() * (containerHeight * spreadFactorY)
            } else {
                // Random y position within the reduced height, more focused near edges
                y =
                    Math.random() < 0.5
                        ? marginY + Math.random() * (containerHeight * 0.2) // Top side
                        : containerHeight -
                          marginY -
                          Math.random() * (containerHeight * 0.2) // Bottom side
                // Random x position within the entire width
                x = marginX + Math.random() * (containerWidth * spreadFactorX)
            }

            x -= 100 // move a little left

            isValidPosition = !cloudPositions.some(bubble =>
                areBubblesTooClose(bubble, { x, y })
            )
        }

        cloudPositions.push({ x, y })
    })

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mouseX.set(event.clientX)
            mouseY.set(event.clientY)
        }

        const updateCenter = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                setCenterX(rect.width / 2 - 70)
                setCenterY(rect.height / 2)
            }
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("resize", updateCenter)

        updateCenter() // Initial center calculation after mount

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("resize", updateCenter)
        }
    }, [mouseX, mouseY])

    // Intersection Observer logic
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const entry = entries[0]
                setIsHeroInView(entry.isIntersecting) // Set state when hero content is in view
            },
            { threshold: 0.5 } // Adjust threshold to when the hero is 50% in view
        )

        if (heroRef.current) {
            observer.observe(heroRef.current)
        }

        return () => {
            if (heroRef.current) {
                observer.unobserve(heroRef.current)
            }
        }
    }, [])

    const CalculateMovement = (bubbleX: number, bubbleY: number) => {
        const distX = useSpring(mouseX, {
            stiffness: 100,
            damping: 20,
            mass: 0.3
        })
        const distY = useSpring(mouseY, {
            stiffness: 100,
            damping: 20,
            mass: 0.3
        })

        const x = useTransform(distX, val => val / 20 + bubbleX)
        const y = useTransform(distY, val => val / 20 + bubbleY)

        return { x, y }
    }

    return (
        <section
            className="relative container w-full mx-auto"
            aria-labelledby="hero-section"
            role="region"
        >
            {/* Hero section with a ref to observe visibility */}
            <div
                ref={heroRef}
                className="bg-gradient-to-r from-transparent via-white to-transparent relative z-10 flex flex-col h-1/2 justify-center items-center text-center max-w-7xl gap-8 mx-auto px-4 py-16 md:py-24 mt-16"
                aria-describedby="hero-description"
            >
                {/* Decorative banner with attribution */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }} // More pronounced drop effect
                    animate={{ opacity: 1, y: [50, -10, 0] }}
                    transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
                    className="mt-8 flex justify-center sm:justify-start"
                >
                    <div
                        className="bg-white inline-flex flex-wrap items-center text-center rounded-full px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base leading-5 sm:leading-6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20"
                        aria-label="From the creators of Librarey and Scimantic"
                    >
                        <span>From the creators of</span>
                        <LinkPreview
                            url={"https://www.librarey.com/"}
                            className="hover:underline inline-flex items-center mx-1 sm:mx-2 gap-x-1"
                            target="_blank"
                            aria-label="Visit Librarey website"
                        >
                            <Image
                                src={librareyLogo}
                                alt="Librarey logo"
                                className="self-center w-6 sm:w-8 h-6 sm:h-8"
                            />
                            <span>Librarey</span>
                        </LinkPreview>
                        <span>and</span>
                        <LinkPreview
                            url={"https://scimantic.com/"}
                            className="hover:underline inline-flex items-center mx-1 sm:mx-2 gap-x-1"
                            target="_blank"
                            aria-label="Visit Scimantic website"
                        >
                            <Image
                                src={scimanticLogo}
                                alt="Scimantic logo"
                                className="self-center w-5 sm:w-6 h-5 sm:h-6"
                            />
                            <span>Scimantic</span>
                        </LinkPreview>
                    </div>
                </motion.div>

                <HeroHighlight>
                    <motion.h1
                        id="hero-section"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: [50, -10, 0] }}
                        transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
                        className="max-w-screen-md text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-700 dark:text-white leading-relaxed lg:leading-snug"
                    >
                        Where patient groups
                        <Highlight className="text-black dark:text-white">
                            drive research
                        </Highlight>
                    </motion.h1>
                </HeroHighlight>

                <motion.p
                    id="hero-description"
                    initial={{opacity: 0, y: 50}}
                    animate={{opacity: 1, y: [50, -10, 0]}}
                    transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
                    className="max-w-screen-sm text-2xl"
                >
                    {`Build your research plan, discover partners, and launch new projects.`}
                </motion.p>
            </div>

            {/* Render bubbles whether or not the hero is in view, but hide them until hero is in view */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: [50, -10, 0] }}
                transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
                className="hidden sm:block absolute inset-0 z-0 pointer-events-none opacity-50"
                ref={containerRef}
                aria-hidden="true"
            >
                {bubbles.map((bubble, index) => {
                    const { x, y } = CalculateMovement(
                        cloudPositions[index].x,
                        cloudPositions[index].y
                    )

                    return (
                        <motion.a
                            key={index}
                            href={bubble.href}
                            className="absolute bg-white text-black shadow-lg p-4 rounded-full border border-gray-200 hover:z-50 pointer-events-auto"
                            style={{
                                x,
                                y,
                                zIndex: -1,
                                opacity: isHeroInView ? 1 : 0
                            }} // Control visibility here
                            whileHover={{ scale: 1.4 }} // Increased scale on hover
                            whileTap={{ scale: 0.8 }} // More exaggerated tap feedback
                            transition={{
                                type: "spring",
                                stiffness: 100,
                                damping: 15
                            }} // Stronger spring effect
                            aria-label={`Link to ${bubble.title}`}
                        >
                            {bubble.title}
                        </motion.a>
                    )
                })}
            </motion.div>
        </section>
    )
}
