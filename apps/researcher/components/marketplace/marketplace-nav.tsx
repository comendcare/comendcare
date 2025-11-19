"use client"
import { TabNav } from "@comend/components/tab-nav";
import { Database, Megaphone, Rat, TestTubeDiagonal, Users } from "lucide-react";
import React from "react";

const links = [
    {
        name: "Patient groups",
        href: "/marketplace/patient-groups",
        icon: Users,
        comingSoon: false
    },
    {
        name: "Patient biosamples",
        href: "/marketplace/biosamples",
        icon: TestTubeDiagonal,
        comingSoon: false
    },
    {
        name: "Disease models",
        href: "/marketplace/disease-models",
        icon: Rat,
        comingSoon: false
    },
    {
        name: "Clinical datasets",
        href: "/marketplace/clinical-datasets",
        icon: Database,
        comingSoon: false
    },
    {
        name: "RFPs",
        href: "/marketplace/rfps",
        icon: Megaphone,
        comingSoon: false
    },
]

export function MarketplaceNav({className}: React.HTMLAttributes<HTMLDivElement>) {

    return (
        <TabNav 
            className={className}
            baseLink={""}
            links={links}
        />
    )
}
