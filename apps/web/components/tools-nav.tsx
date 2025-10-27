"use client"
import { TabNav } from "@comend/components/tab-nav";
import { Database, Rat, TestTubeDiagonal } from "lucide-react";

const links = [
    {
        name: "Patient biosamples",
        href: "/biosample",
        icon: TestTubeDiagonal,
        comingSoon: false,
    },
    {
        name: "Disease models",
        href: "/disease-models",
        icon: Rat,
        comingSoon: false,
    },
    {
        name: "Clinical datasets",
        href: "/data",
        icon: Database,
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
