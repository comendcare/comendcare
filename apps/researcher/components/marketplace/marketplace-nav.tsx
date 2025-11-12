"use client"
import { Button } from "@/packages/components/ui/button";
import { TabNav } from "@comend/components/tab-nav";
import { ArrowLeft, Building2, Database, Megaphone, Rat, Search, SearchIcon, TestTubeDiagonal, Users } from "lucide-react";
import Link from "next/link";
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
        // name: "Requests for Proposals",
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
            baseLink={"/app"}
            links={links}
        />
    )
}
