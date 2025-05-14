"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { X } from "lucide-react"

export function ComendEmbedBanner() {
    const [isVisible, setIsVisible] = useState(true)

    const handleClose = () => {
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 sm:px-6 sm:pb-5 lg:px-8">
            <div className="pointer-events-auto flex items-center justify-between gap-x-6 bg-gray-900 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
                <p className="text-sm leading-6 text-white">
                    <a href={`http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} target="_blank">
                        Check out Comend for more information &nbsp;<span aria-hidden="true">&rarr;</span>
                    </a>
                </p>
                <Button
                    variant="ghost"
                    className="-m-3 flex-none p-3 focus-visible:outline-offset-[-4px] hover:bg-gray-900 hover:text-accent-foreground"
                    onClick={handleClose}
                >
                    <span className="sr-only">Dismiss</span>
                    <X aria-hidden="true" className="h-4 w-4 text-white" />
                </Button>
            </div>
        </div>
    )
}