"use client"

import React, {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import {Badge} from "@comend/components/ui/badge";
import {Skeleton} from "@comend/components/ui/skeleton";
import { Separator } from "@comend/components/ui/separator";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { RESEARCH_PLAN_STATUS, RESEARCH_PLAN_TYPES, RESEARCH_STAGE } from "@comend/lib/types";
import { FileText } from "lucide-react";

/** Header skeleton that matches the header’s layout/height to prevent reflow */
function HeaderSkeleton() {
    return (
        <div className="gap-2 relative">
            <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded"/>
                <Skeleton className="h-6 w-48 rounded"/>
                <Skeleton className="h-5 w-16 rounded"/>
            </div>
            <Skeleton className="mt-2 w-3/4 rounded"/>
        </div>
    );
}

export const ResearchPlanCard = ({
    researchPlan, 
    showOrganization = false, 
}: { 
    researchPlan: any; 
    showOrganization?: boolean; 
}) => {
    // Gate the header (and actions menu) until after hydration
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <Card className="h-full w-full text-left flex flex-col">
            <CardHeader className="gap-2 relative pb-2">
                {/* Before hydration: render a stable skeleton to prevent any flash. After hydration: render the real header. */}
                {!mounted ? (
                    <HeaderSkeleton/>
                ) : (
                    <>
                        {showOrganization && researchPlan.organization && (
                            <>
                                <a
                                    href={`http://${researchPlan.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                                    onClick={(e) => e.stopPropagation()}
                                    target="_blank"
                                >
                                    <div className="flex flex-row gap-2 items-center">
                                        <ProfilePhoto img={researchPlan.organization.image} name={researchPlan.organization.name} className="h-9 w-9 -mt-1"/>
                                        <p className="text-lg font-semibold underline">{researchPlan.organization.name}</p>
                                    </div>
                                </a>
                                <Separator className="mt-auto" />
                            </>
                        )}
                        <div className="flex gap-2 items-center">
                            <CardTitle className="text-lg max-w-full leading-normal">
                                {researchPlan.title}
                            </CardTitle>
                        </div>
                    </>
                )}
            </CardHeader>

            <CardContent className="h-full flex flex-col gap-4">

                <CardDescription className="line-clamp-3 overflow-hidden">
                    {researchPlan.description}
                </CardDescription>
                
                <div className="flex gap-2 flex-wrap">
                    {RESEARCH_PLAN_TYPES.filter(modality => researchPlan.modalities.includes(modality.value)).map(m => (
                        <Badge variant={"secondary"} className="text-sm">{m.label}</Badge>
                    ))}

                    {RESEARCH_STAGE.filter(stage => researchPlan.stages.includes(stage.value)).map(s => (
                        <Badge variant={"secondary"} className="text-sm">{s.label}</Badge>
                    ))}

                    {RESEARCH_PLAN_STATUS.filter(status => researchPlan.statuses.includes(status.value)).map(s => (
                        <Badge variant={"secondary"} className="text-sm">{s.label}</Badge>
                    ))}

                    {(researchPlan.milestones && researchPlan.milestones.length > 0) && (
                        <Badge variant={"secondary"} className="text-sm">
                            <FileText className="h-4 w-4" />
                            {researchPlan.milestones.length == 1 ? `1 project` : `${researchPlan.milestones.length} projects`}
                        </Badge>
                    )}
                </div>

            </CardContent>
        </Card>
    );
};
