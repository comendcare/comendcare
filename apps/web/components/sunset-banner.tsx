"use client"

import React, { useState } from "react"
import { Button } from "@comend/components/ui/button"
import { X } from "lucide-react"

// Shown on every page when SUNSET_MODE=banner (see lib/sunset.ts)
export function SunsetBanner({message, contactEmail}: { message: string, contactEmail: string }) {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] sm:px-6 sm:pb-5 lg:px-8">
            <div className="pointer-events-auto mx-auto flex w-fit items-center justify-between gap-x-6 bg-gray-900 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
                <p className="text-sm leading-6 text-white">
                    <strong className="font-semibold">{message}</strong>{" "}
                    Questions? Contact{" "}
                    <a href={`mailto:${contactEmail}`} className="whitespace-nowrap underline underline-offset-2">
                        {contactEmail}
                    </a>
                </p>
                <Button
                    variant="ghost"
                    className="-m-3 flex-none p-3 focus-visible:outline-offset-[-4px] hover:bg-gray-900 hover:text-accent-foreground"
                    onClick={() => setIsVisible(false)}
                >
                    <span className="sr-only">Dismiss</span>
                    <X aria-hidden="true" className="h-4 w-4 text-white"/>
                </Button>
            </div>
        </div>
    )
}
