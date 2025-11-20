"use client"

import React from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import { ProfilePhoto } from "@comend/components/profile-photo";
import TruncatedList from "@comend/components/marketplace/marketplace-pag-card";
import { MILESTONE_TYPE_OPTIONS_WITH_VALUE } from "@comend/components/marketplace/service-providers/cro-filters";
import { MODALITIES } from "@comend/lib/types";

export const ResearcherCard = ({researcher}: {researcher: any}) => {
    console.log(`researcher data`, researcher)

    const tags: string[] = 
        MILESTONE_TYPE_OPTIONS_WITH_VALUE.filter((option: any) => researcher.researchInterests.includes(option.label)).map((option: any) => option.label)
            .concat(MODALITIES.filter((option: any) => researcher.therapeuticsOfInterest.includes(option.label)).map((option: any) => option.label))
            .concat(researcher.conditionsOfInterest)
            .concat(researcher.genesOfInterest)

    return (
        <Card className="h-full w-full text-left flex flex-col">
            <CardHeader className="gap-2 relative pb-2">
                <div className="flex flex-row gap-2 items-start">
                    <ProfilePhoto img={researcher.user?.image} name={researcher.name} className="h-9 w-9 -mt-1"/>
                    <div className="flex flex-col gap-1">
                        <CardTitle>{researcher.name}</CardTitle>
                        <CardDescription>{researcher.role}</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="h-full flex flex-col gap-4">
                <span className="w-full flex flex-row gap-2 min-h-[24px]">
                    <TruncatedList items={tags} />
                </span>

            </CardContent>
        </Card>
    );
};
