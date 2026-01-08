"use client"

import { cn } from "@udecode/cn"
import { useEffect, useRef, useState } from "react"
import { Button } from "./ui/button"

export function SeeMoreDescription({ description }: { description: string }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isTruncated, setIsTruncated] = useState(false)
    const textRef = useRef<HTMLParagraphElement>(null)

    useEffect(() => {
        const el = textRef.current
        if (!el) return

        // Only check truncation when collapsed
        if (!isExpanded) {
            setIsTruncated(el.scrollHeight > el.clientHeight)
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

            {isTruncated && (
                isExpanded ? (
                    <Button
                        variant="link"
                        onClick={() => setIsExpanded(false)}
                        className="p-0 h-fit underline"
                    >
                        See less
                    </Button>
                ) : (
                    <Button
                        variant="link"
                        onClick={() => setIsExpanded(true)}
                        className="p-0 h-fit underline"
                    >
                        See more
                    </Button>
                )
            )}
        </div>
    )
}