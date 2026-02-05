import { useState } from "react"
import { Button } from "./button"
import { cn } from "@comend/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"

export const CaretAccordion = ({title, content, className}: {title: string, content: React.ReactNode, className?: string}) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={cn("flex flex-col gap-2", className)} >
            <span className="flex gap-2 items-center">
                <Button 
                    variant={'ghost'} 
                    className="p-0 h-6 w-6"
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    {isOpen ? (
                        <ChevronDown />
                    ) : (
                        <ChevronRight />
                    )}
                </Button>
                <p className="text-xl font-semibold">{title}</p>
            </span>
            {isOpen && (
                <div>
                    {content}
                </div>
            )}
        </div>
    )
}