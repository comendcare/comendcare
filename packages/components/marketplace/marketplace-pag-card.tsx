import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@comend/components/ui/card";
import Link from "next/link";
import {formatMoney, getStage} from "@comend/lib/utils";
import {Badge} from "@comend/components/ui/badge";
import {ProfilePhoto} from "@comend/components/profile-photo";
import {Separator} from "@comend/components/ui/separator";
import {CircleDollarSign, FileText, MegaphoneIcon, MicroscopeIcon, Users} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {PropertyBadge} from "@comend/components/property-badge";
import { milestoneCategories, MODALITIES, Option } from "@comend/lib/types";

type NodeTypeCount = Record<string, number>;

export function OrganizationMarketplaceCard({
                                                organization,
                                                isPublic,
                                                savedOrganizationIds
                                            }: {
                                                organization: any,
                                                isPublic: boolean,
                                                savedOrganizationIds?: Set<string>
                                            }
) {
    const {subdomain, image, name, description, moneyDeployed, conditions, therapeuticsOfInterest} = organization
    const orgCondition = conditions?.[0]?.condition || {}
    const {associatedGenes = [], causalGenes = [], numberOfPatientsEngaged} = orgCondition

    const numProjects = organization.milestones?.length || 0
    const numTools = (organization.tools?.length || 0) + (organization.biosamples?.length || 0) + (organization.diseaseModels?.length || 0)
    const numRFPs = organization.rfps?.length || 0

    const stages = Object.keys(milestoneCategories)

    const therapeuticStrategiesList = new Set(
        (organization.roadmaps || []).sort((a: any, b: any) => {
            const aStage = getStage(a.milestones)
            const bStage = getStage(b.milestones)

            const aIndex = stages.indexOf(aStage.value)
            const bIndex = stages.indexOf(bStage.value)

            return bIndex - aIndex
        })
            .map((roadmap: any) => roadmap.modalities || [])
            .flat()
            .map((modalityValue: string | undefined) => MODALITIES.find(modality => modality.value === modalityValue))
            .map((modality: Option) => modality?.label)
            .filter((modality: string | undefined) => typeof modality === 'string')
    ) as Set<string>

    return (
        <Link
            href={
                process.env.NEXT_PUBLIC_VERCEL_ENV
                    ? `https://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                    : `http://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
            }
            target="_blank"
        >
            <Card className="h-full w-full text-left flex flex-col gap-0">
                <CardHeader className="gap-2">
                    <div className="flex justify-between">
                        <Link
                            // href={
                            //     process.env.NEXT_PUBLIC_VERCEL_ENV
                            //         ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/organization/${subdomain}`
                            //         : `http://localhost:3000/app/organization/${subdomain}`
                            // }
                            href={
                                process.env.NEXT_PUBLIC_VERCEL_ENV
                                    ? `https://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                                    : `http://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                            }
                            target="_blank"
                        >
                            <CardTitle className="text-xl flex flex-row gap-2 items-start h-[56px]">
                                <ProfilePhoto img={image} name={name} className="h-9 w-9 -mt-1"/>
                                {name}
                            </CardTitle>
                        </Link>
                        {/*{!isPublic && <SaveOrganizationDialog savedOrganization={organization} type={"card"}/>}*/}
                        {/*{!isPublic && <SaveOrganizationButton*/}
                        {/*    savedOrganization={organization}*/}
                        {/*    type={"card"}*/}
                        {/*    savedOrganizationIds={savedOrganizationIds}*/}
                        {/*/>}*/}
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col h-full justify-end gap-4">
                    <div className="w-full grid gap-2 grid-cols-2 min-h-[20px]">
                        {moneyDeployed !== null && moneyDeployed > 0 && (
                            <div className="text-sm text-gray-700 m-0 flex items-center">
                                <CircleDollarSign className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>
                                {formatMoney(moneyDeployed)} deployed
                            </div>
                        )}
                        {numberOfPatientsEngaged !== null && numberOfPatientsEngaged > 0 && (
                            <div className="text-sm text-gray-700 m-0 flex items-center">
                                <Users className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>
                                {numberOfPatientsEngaged} patients
                            </div>
                        )}
                    </div>
                    <div className="w-full flex flex-row gap-2 min-h-[24px]">
                        <TruncatedList items={Array.from(therapeuticStrategiesList)}/>
                    </div>
                    <div className="flex flex-wrap w-full gap-4 min-h-[20px]">
                        {numProjects > 0 && (
                            <PropertyBadge icon={FileText}>
                                <span className="flex flex-row items-center gap-x-1 whitespace-nowrap">
                                    <div className="text-sm">{numProjects}</div>
                                    {numProjects > 1 ? "Projects" : "Project"}
                                </span>
                            </PropertyBadge>
                        )}
                        {numTools > 0 && (
                            <PropertyBadge icon={MicroscopeIcon}>
                                <span className="flex flex-row items-center gap-x-1 whitespace-nowrap">
                                    <div className="text-sm">{numTools}</div>
                                    {numTools > 1 ? "Tools" : "Tool"}
                                </span>
                            </PropertyBadge>
                        )}
                        {numRFPs > 0 && (
                            <PropertyBadge icon={MegaphoneIcon}>
                                <span className="flex flex-row items-center gap-x-1 whitespace-nowrap">
                                    <div className="text-sm">{numRFPs}</div>
                                    {numRFPs > 1 ? "RFPs" : "RFP"}
                                </span>
                            </PropertyBadge>
                        )}
                    </div>
                </CardContent>
                <div>
                    <Separator className="mb-4"/>
                    <CardFooter className="h-fit flex flex-col items-start space-y-2">
                        <h2 className="text-base font-semibold min-h-[24px]">
                            {orgCondition.name}
                        </h2>
                        <span className="w-full flex flex-row gap-2 min-h-[24px]">
                            <TruncatedList items={(causalGenes || []).concat((associatedGenes || []))} />
                        </span>
                    </CardFooter>
                </div>
            </Card>
        </Link>
    );
}

export default function TruncatedList({ items }: { items: string[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(items.length);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateVisibleItems = () => {
            const allChildren = Array.from(container.children) as HTMLElement[];

            const itemEls = allChildren.filter(
                (el) => !el.dataset.moreIndicator
            );

            let totalWidth = 0;
            let count = 0;

            for (let i = 0; i < itemEls.length; i++) {
                const child = itemEls[i];
                totalWidth += child.offsetWidth;
                if (totalWidth <= container.offsetWidth) {
                    count++;
                } else {
                    break;
                }
            }

            const overflow = count < itemEls.length;

            const visible = overflow ? Math.max(1, count - 1) : count;
            setVisibleCount(visible);
        };

        const raf = requestAnimationFrame(updateVisibleItems);
        window.addEventListener("resize", updateVisibleItems);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", updateVisibleItems);
        };
    }, [items]);

    const hiddenCount = items.length - visibleCount;

    return (
        <div
            ref={containerRef}
            className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
            style={{ width: "100%" }}
        >
        {items.slice(0, visibleCount).map((item) => (
            <Badge key={item} className="text-xs flex">
                {item}
            </Badge>
        ))}
        {hiddenCount > 0 && (
            <span className="text-gray-500 text-xs flex-shrink-0">
            +{hiddenCount} more
            </span>
        )}
        </div>
    );
}
