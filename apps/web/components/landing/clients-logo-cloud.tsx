"use client"
import { motion } from "framer-motion"
import logoYellowForYiannis from "@/public/logos/affiliations/yellow-for-yiannis.png"
import logoSMOC1 from "@/public/logos/affiliations/smoc1.png"
import Image from "next/image"
import React from "react"

export function ClientsLogoCloud() {
    const logos = [
        {
            name: "Yellow for Yiannis",
            src: logoYellowForYiannis,
        },
        {
            name: "SMOC1",
            src: logoSMOC1,
        },
    ]

    return (
        <motion.section
            initial={{opacity: 0, y: 50}}
            animate={{opacity: 1, y: [50, -10, 0]}}
            transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
            id="features"
            className="w-full container mx-auto max-w-7xl px-8 py-16 space-y-8"
            aria-labelledby="features-heading"
        >
            <div className="relative px-4 md:px-8 py-24 w-full overflow-hidden space-y-8">
                <h3 className="text-center mx-auto text-3xl md:text-4xl font-bold mb-4">
                    Used by
                </h3>
                <div className="grid grid-cols-3 gap-10 w-full max-w-3xl mx-auto  relative">
                    {logos.map(logo => (
                        <div
                            key={logo.name}
                            className="flex items-center justify-center"
                        >
                            <Image
                                src={logo.src}
                                alt={logo.name}
                                width={100}
                                height={100}
                                className="w-full object-contain select-none dark:filter dark:invert"
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </motion.section>
    )
}
