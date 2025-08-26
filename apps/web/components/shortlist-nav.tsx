"use client"
import { TabNav } from "@comend/components/tab-nav";
import { Building2, Users } from "lucide-react";

const links = [
    {
        name: "Service Providers",
        href: "/shortlist/service-providers",
        icon: Building2,
        comingSoon: false
    },
    {
        name: "Patient Groups",
        href: "/shortlist/patient-groups",
        icon: Users,
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
            baseLink={"/app"}
            links={links}
        />
    )
}
