"use client"

import Link from "next/link"
import {usePathname} from "next/navigation"

import {cn} from "@/lib/utils"

const links = [
    {
        name: "Researchers",
        href: "/researchers",
    },
    {
        name: "Contractors",
        href: "/contractors",
    },
]

interface ExamplesNavProps extends React.HTMLAttributes<HTMLDivElement> {
    projectId: string
}

export function ProjectNav({className, projectId, ...props}: ExamplesNavProps) {
    const pathname = usePathname()

    return (
        <div className={cn("mb-4 flex items-center", className)} {...props}>
            {links.map((link, index) => (
                <Link
                    href={"/app/marketplace/" + link.href}
                    key={link.href}
                    className={cn(
                        "flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                        pathname?.endsWith(link.href) ||
                        (index === 0 && pathname === "/")
                            ? "bg-muted font-medium text-primary"
                            : "text-muted-foreground"
                    )}
                >
                    {link.name}
                </Link>
            ))}
        </div>
    )
}