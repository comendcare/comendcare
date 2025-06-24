// src/components/app-nav.tsx (Client Component)

"use client"

import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip"
import { usePathname } from "next/navigation"
import {ReactNode} from "react";

interface NavProps {
    isCollapsed: boolean
    links: {
        title: string
        label?: string
        icon: LucideIcon
        variant: "default" | "ghost"
        href: string
    }[]
    children: ReactNode
}

export function AppNav({ links, isCollapsed, children }: NavProps) {
    const pathname = usePathname()

    return (
        <div
            data-collapsed={isCollapsed}
            // className="group h-[calc(100vh-53px)] px-2 flex flex-col justify-between gap-4 py-2 data-[collapsed=true]:py-2"
            className={cn(
                "group h-[calc(100vh-53px)] px-2 flex flex-col justify-between gap-4 py-2 data-[collapsed=true]:py-2",
                isCollapsed ? "h-[calc(100vh-103px)]" : ""
            )}
        >
            <div>
                <nav className="grid gap-1 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                    {links.map((link, index) => {
                        const isActive =
                            pathname?.endsWith(link.href) ||
                            (index === 0 && pathname === "/")

                        return isCollapsed ? (
                            <TooltipProvider delayDuration={0}>
                                <Tooltip key={index} delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                buttonVariants({
                                                    variant: link.variant,
                                                    size: "icon"
                                                }),
                                                "h-9 w-9",
                                                link.variant === "default" &&
                                                "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
                                                isActive && "bg-muted text-primary"
                                            )}
                                        >
                                            <link.icon className="h-4 w-4" />
                                            <span className="sr-only">
                                                {link.title}
                                            </span>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        className="flex items-center gap-4"
                                    >
                                        {link.title}
                                        {link.label && (
                                            <span className="ml-auto text-muted-foreground">
                                                {link.label}
                                            </span>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <Link
                                key={index}
                                href={link.href}
                                className={cn(
                                    buttonVariants({
                                        variant: link.variant,
                                        size: "sm"
                                    }),
                                    link.variant === "default" &&
                                    "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                                    "justify-start",
                                    isActive && "bg-muted text-primary font-medium",
                                )}
                            >
                                <link.icon className="mr-2 h-4 w-4" />
                                {link.title}
                                {link.label && (
                                    <span
                                        className={cn(
                                            "ml-auto",
                                            link.variant === "default" &&
                                            "text-background dark:text-white"
                                        )}
                                    >
                                        {link.label}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            {children}
        </div>
    )
}
