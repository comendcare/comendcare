"use client"

import Link from "next/link"
import {usePathname} from "next/navigation"

import {cn} from "@/lib/utils"

const examples = [
    {
        name: "Budget",
        href: "/budget",
        code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(app)/examples/forms",
    },
    {
        name: "Timeline",
        href: "/timeline",
        code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(app)/examples/forms",
    },
]

interface ExamplesNavProps extends React.HTMLAttributes<HTMLDivElement> {
    projectId: string
}

export function ProjectNav({className, projectId, ...props}: ExamplesNavProps) {
    const pathname = usePathname()

    return (
        <div className={cn("mb-4 flex items-center", className)} {...props}>
            {examples.map((example, index) => (
                <Link
                    href={"/pag/project/" + projectId + example.href}
                    key={example.href}
                    className={cn(
                        "flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                        pathname?.endsWith(example.href) ||
                        (index === 0 && pathname === "/")
                            ? "bg-muted font-medium text-primary"
                            : "text-muted-foreground"
                    )}
                >
                    {example.name}
                </Link>
            ))}
        </div>
    )
}