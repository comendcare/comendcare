"use client"
import { TabNav } from "@comend/components/tab-nav";

const links = [
    {
        name: "Biosample Tools",
        href: "/biosample",
        comingSoon: false,
    },
    {
        name: "Data Tools",
        href: "/data",
        comingSoon: false,
    },
]

export function ToolsNav({className}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <TabNav 
            className={className}
            baseLink={"/app/tools"}
            links={links}
        />
    )
}