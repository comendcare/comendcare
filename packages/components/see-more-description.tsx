"use client"

import {cn} from "@udecode/cn"
import {useEffect, useRef, useState} from "react"
import {Button} from "./ui/button"

export function SeeMoreDescription({description}: { description: string }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isOverflowing, setIsOverflowing] = useState(false)
    const textRef = useRef<HTMLParagraphElement>(null)

    useEffect(() => {
        const el = textRef.current
        if (!el) return

        // Only check overflow when collapsed
        if (!isExpanded) {
            setIsOverflowing(el.scrollHeight > el.clientHeight)
        }
    }, [description, isExpanded])

    return (
        <div className="flex flex-col items-end gap-2">
            <p
                ref={textRef}
                className={cn(
                    "w-full",
                    isExpanded ? "" : "line-clamp-4"
                )}
                data-testid="conditions-summary"
            >
                {description}
            </p>

            {isOverflowing && (
                <Button
                    variant="link"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-0 h-fit underline"
                >
                    {isExpanded ? "See less" : "See more"}
                </Button>
            )}
        </div>
    )
}
