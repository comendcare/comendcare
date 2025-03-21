"use client"
import logoCharacter from "@/public/logos/affiliations/Character.png"
import logoManeki from "@/public/logos/affiliations/Maneki.png"
import logoDrive from "@/public/logos/affiliations/Drive.jpg"
import logoFoundersBoost from "@/public/logos/affiliations/FoundersBoost.png"
import logoNextAI from "@/public/logos/affiliations/NextAI.png"
import logoOpenTreatments from "@/public/logos/affiliations/Open Treatments.png"
import logo11ElevenLabsGrants from "@/public/logos/affiliations/11ElevenLabsGrants.png"
import logoCuresDev from "@/public/logos/affiliations/CuresDev.png"
import logoOdylia from "@/public/logos/affiliations/Odylia.png"
import logoOUAG from "@/public/logos/affiliations/OUAG.png"
import logoWABS from "@/public/logos/affiliations/WABS.png"
import Image from "next/image"
import React from "react"

export function PartneredWithLogoCloud() {
    const logos = [
        {
            name: "Character",
            src: logoCharacter
        },
        {
            name: "Maneki",
            src: logoManeki
        },
        {
            name: "Drive",
            src: logoDrive
        },
        // {
        //     name: "Founders Boost",
        //     src: logoFoundersBoost
        // },
        {
            name: "Next AI",
            src: logoNextAI
        },
        {
            name: "Open Treatments",
            src: logoOpenTreatments
        },
        // {
        //     name: "11ElevenLabsGrants",
        //     src: logo11ElevenLabsGrants
        // },
        {
            name: "Odylia",
            src: logoOdylia
        }
        // {
        //     name: "OUAG",
        //     src: logoOUAG,
        // },
        // {
        //     name: "WABS",
        //     src: logoWABS,
        // },
    ]

    return (
        <div className="relative px-4 md:px-8 py-24 w-full overflow-hidden space-y-8">
            <h2 className="text-center text-2xl md:text-5xl font-bold pb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-600">
                Partnered with:
            </h2>
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
    )
}
