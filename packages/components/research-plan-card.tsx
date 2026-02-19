"use client"

import React from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import {Badge} from "@comend/components/ui/badge";
import {Skeleton} from "@comend/components/ui/skeleton";
import { Separator } from "@comend/components/ui/separator";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { RESEARCH_PLAN_STATUS, RESEARCH_PLAN_TYPES, RESEARCH_STAGE } from "@comend/lib/types";
import { Building, ExternalLink, LinkIcon, Lock, Globe } from "lucide-react";
import ClaimedBadge from "comend-pag-platform/components/claimed-badge";
import Link from "next/link";

// /** Header skeleton that matches the header’s layout/height to prevent reflow */
// function HeaderSkeleton() {
//     return (
//         <div className="gap-2 relative">
//             <div className="flex items-center gap-2">
//                 <Skeleton className="h-6 w-6 rounded"/>
//                 <Skeleton className="h-6 w-48 rounded"/>
//                 <Skeleton className="h-5 w-16 rounded"/>
//             </div>
//             <Skeleton className="mt-2 w-3/4 rounded"/>
//         </div>
//     );
// }

export const ResearchPlanCard = ({
    researchPlan, 
    showOrganization = false, 
}: { 
    researchPlan: any; 
    showOrganization?: boolean; 
}) => {
    // // Gate the header (and actions menu) until after hydration
    // const [mounted, setMounted] = useState(false);
    // useEffect(() => setMounted(true), []);

    return (
        <Card className="h-full relative flex flex-col gap-4">
            <div className="absolute top-0 w-full p-6 flex gap-2 justify-between">
                {researchPlan.private 
                    ? (
                        <div className="flex gap-1 items-center text-sm text-muted-foreground">
                            <Lock className="h-4 w-4"/>
                            Private
                        </div>
                    )
                    : (
                        <div className="flex gap-1 items-center text-sm text-muted-foreground">
                            <Globe className="h-4 w-4"/>
                            Published
                        </div>
                    )
                }
                {RESEARCH_PLAN_STATUS
                    .filter(option => researchPlan.statuses.includes(option.value))
                    .map(status => <Badge className="text-sm" variant={"secondary"}>{status.label}</Badge>)}
            </div>
            <CardHeader className="mt-10 pb-0">
                <CardTitle>{researchPlan.title || 'Untitled research plan'}</CardTitle>
                <CardDescription className="line-clamp-4">{researchPlan.description}</CardDescription>
            </CardHeader>
            <CardContent className="h-full flex flex-col gap-4">
                <div className="w-full flex gap-4">
                    {researchPlan.modalities.length > 0 && (
                        <div className="w-full flex flex-col gap-2">
                            <h2 className="text-sm">Research strategy</h2>
                            {RESEARCH_PLAN_TYPES
                                .filter(option => researchPlan.modalities.includes(option.value))
                                .map(strategy => (
                                    <Badge className="text-sm w-fit" variant="blue">{strategy.label}</Badge>
                                ))}
                        </div>
                    )}

                    {researchPlan.stages.length > 0 && (
                        <div className="w-full flex flex-col gap-2">
                            <h2 className="text-sm">Stage</h2>
                            {RESEARCH_STAGE
                                .filter(option => researchPlan.stages.includes(option.value))
                                .map(stage => (
                                    <Badge className="text-sm w-fit" variant={stage.variant}>{stage.label}</Badge>
                                ))}
                        </div>
                    )}
                </div>

                {(researchPlan.partners.length > 0 || researchPlan.links.length > 0) && (
                    <>
                    <Separator />
                    <div className="flex flex-col gap-4">
                        {researchPlan.partners.length > 0 && (
                            <div className="w-full flex flex-col gap-2">
                            <h2 className="text-sm flex gap-1 items-center"><Building className="h-4 min-h-4 w-4 min-w-4"/> Partners</h2>
                            <div className="flex gap-2">
                                <ul className="flex gap-2">
                                    {researchPlan.partners.map((partner: any, index: number) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <Badge variant={'secondary'} className="text-sm">{partner.affiliation}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            </div>
                        )}
                    
                        {researchPlan.links.length > 0 && (
                            <div className="w-full flex flex-col gap-2">
                            <h2 className="text-sm flex gap-1 items-center"><LinkIcon className="h-4 min-h-4 w-4 min-w-4"/> Links</h2>
                            <div className="flex gap-2">
                                <ul className="flex flex-col gap-2">
                                    {researchPlan.links?.map((attachment: any, index: number) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <Link 
                                                className="line-clamp-2 underline" 
                                                href={attachment.link || "/"}
                                                target="_blank"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                            {attachment.name || attachment.link}
                                            </Link>
                                            <ExternalLink className="h-4 min-h-4 w-4 min-w-4"/>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            </div>
                        )}
                    </div>
                    </>
                )}

                {(showOrganization && researchPlan.organization) && (
                    <>
                    <Separator className="mt-auto" />
                    <a
                        href={`http://${researchPlan.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                    >
                        <div className="flex flex-row gap-2 items-center">
                            <ProfilePhoto img={researchPlan.organization.image} name={researchPlan.organization.name} className="h-9 w-9 -mt-1"/>
                            <p className="text-lg font-semibold underline">{researchPlan.organization.name}</p>
                            <ClaimedBadge
                                organization={researchPlan.organization}
                                mini={true}
                            />
                        </div>
                    </a>
                    </>
                )}

            </CardContent>
        </Card>
    );
};
