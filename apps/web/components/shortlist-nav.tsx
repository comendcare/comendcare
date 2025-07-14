"use client"
import { TabNav } from "@comend/components/tab-nav";

const links = [
    {
        name: "Service Providers",
        href: "/service-providers",
        comingSoon: false
    },
    {
        name: "Patient Groups",
        href: "/patient-groups",
        comingSoon: false
    },
    // {
    //     name: "Milestones",
    //     href: "/milestones",
    //     comingSoon: false
    // },
]

export function ShortlistNav({className}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <TabNav 
            className={className}
            baseLink={"/app/shortlist/"}
            links={links}
        />
    )
}
