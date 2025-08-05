"use client"
import { TabNav } from "@comend/components/tab-nav";

const links = [
    {
        name: "Patient Biosamples",
        href: "/biosample",
        comingSoon: false,
    },
    {
        name: "Disease Models",
        href: "/disease-models",
        comingSoon: false,
    },
    {
        name: "Clinical Datasets",
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