"use client"

import { cn } from "@udecode/cn"
import { useState } from "react"
import { Button } from "./ui/button"

export function SeeMoreDescription({description}: {description: string}) {
    const [isExpanded, setIsExpanded] = useState(false)
    
    return (
        <div className="flex flex-col items-end gap-2">
            <p 
                className={cn(
                    "w-full",
                    isExpanded ? "" : "line-clamp-4"
                )}
                data-testid="conditions-summary"
            >
                {description}
            </p>
            {isExpanded ? (
                <Button variant={'link'} onClick={() => setIsExpanded(false)} className="p-0 h-fit underline">
                    See less
                </Button>
            ) : (
                <Button variant={'link'} onClick={() => setIsExpanded(true)} className="p-0 h-fit underline">
                    See more
                </Button>
            )}
        </div>
    )
}