"use client"

import React from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import { ProfilePhoto } from "@comend/components/profile-photo";
import TruncatedList from "@comend/components/marketplace/marketplace-pag-card";
import { MILESTONE_TYPE_OPTIONS_WITH_VALUE } from "@comend/components/marketplace/service-providers/cro-filters";
import { MODALITIES } from "@comend/lib/types";
import { Badge } from "@comend/components/ui/badge";
import { PropertyBadge } from "@comend/components/property-badge";
import { Building2, MapPin } from "lucide-react";

export const ResearcherCard = ({researcher}: {researcher: any}) => {
    const researchInterests: string[] = MILESTONE_TYPE_OPTIONS_WITH_VALUE.filter((option: any) => researcher.researchInterests.includes(option.value)).map((option: any) => option.label)
    const therapeuticsOfInterest: string[] = MODALITIES.filter((option: any) => researcher.therapeuticsOfInterest.includes(option.value)).map((option: any) => option.label)
    const conditionsOfInterest: string[] = researcher.conditionsOfInterest
    const genesOfInterest: string[] = researcher.genesOfInterest

    return (
        <Card className="h-full w-full text-left flex flex-col gap-2">
            <CardHeader className="gap-2 relative pb-2">
                <div className="flex flex-row gap-2 items-start">
                    <ProfilePhoto img={researcher.user?.image} name={researcher.name || researcher.user?.name} className="h-9 w-9 -mt-1"/>
                    <div className="flex flex-col gap-1">
                        <CardTitle>{researcher.name || researcher.user?.name}</CardTitle>
                        <CardDescription>{researcher.role}</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                <div className="flex gap-4 flex-wrap">
                    {(researcher.affiliations && researcher.affiliations.length > 0) && (
                        <PropertyBadge icon={Building2}>
                            <span className="flex flex-row items-center gap-x-1 whitespace-nowrap">
                                <div className="text-sm">
                                    {researcher.affiliations.map((affiliation: any) => affiliation.institution?.name).join(',')}
                                </div>
                            </span>
                        </PropertyBadge>
                    )}
                    {(researcher.country) && (
                        <PropertyBadge icon={MapPin}>
                            <span className="flex flex-row items-center gap-x-1 whitespace-nowrap">
                                <div className="text-sm">
                                    {researcher.country}
                                </div>
                            </span>
                        </PropertyBadge>
                    )}
                </div>
                {(
                    (researchInterests && researchInterests.length > 0) || 
                    (therapeuticsOfInterest && therapeuticsOfInterest.length > 0) ||
                    (conditionsOfInterest && conditionsOfInterest.length > 0) ||
                    (genesOfInterest && genesOfInterest.length > 0)
                ) && (
                    <>
                    <h2 className="text-md font-semibold">Research interests</h2>
                    <div className="flex flex-row flex-wrap gap-2">
                        {researchInterests.map(option => (
                            <Badge 
                                key={option} 
                                className="text-xs flex"
                                variant={"lightBlue"}
                            >{option}</Badge>
                        ))}
                        {therapeuticsOfInterest.map(option => (
                            <Badge 
                                key={option} 
                                className="text-xs flex"
                            >{option}</Badge>
                        ))}
                        {conditionsOfInterest.map(option => (
                            <Badge 
                                key={option} 
                                className="text-xs flex"
                            >{option}</Badge>
                        ))}
                        {genesOfInterest.map(option => (
                            <Badge 
                                key={option} 
                                className="text-xs flex" 
                                variant={"teal"}
                            >{option}</Badge>
                        ))}
                    </div>
                    </>
                )}

            </CardContent>
        </Card>
    );
};
