"use client"
import { TabNav } from "@/packages/components/tab-nav";

const links = [
    {
        name: "Analytics",
        href: "/analytics",
        comingSoon: false
    }
]

export function AdminResearchPlansNav({className}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <TabNav 
            className={className}
            baseLink={"/admin/research-plans/"}
            links={links}
        />
    )
}
