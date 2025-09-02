import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@comend/components/ui/card";
import Link from "next/link";
import {formatMoney, truncate} from "@comend/lib/utils";
import {Badge} from "@comend/components/ui/badge";
import {ProfilePhoto} from "@comend/components/profile-photo";
import {Separator} from "@comend/components/ui/separator";
import {FileText, HandCoins, Megaphone, MegaphoneIcon, Microscope, MicroscopeIcon, Users, Workflow} from "lucide-react";
import React from "react";
import { PropertyBadge } from "../property-badge";
import SaveOrganizationDialog from "../save-organization-dialog";

type NodeTypeCount = Record<string, number>;

export function OrganizationMarketplaceCard({organization, isPublic}: { organization: any, isPublic: boolean }) {
    const {subdomain, image, name, description, moneyDeployed, conditions, therapeuticsOfInterest} = organization
    const orgCondition = conditions?.[0]?.condition || {}
    const {associatedGenes = [], causalGenes = [], numberOfPatientsEngaged} = orgCondition

    const numPlans = organization.roadmaps?.length || 0
    const numProjects = organization.milestones?.length || 0
    const numTools = (organization.tools?.length || 0) + (organization.biosamples?.length || 0) + (organization.diseaseModels?.length || 0)
    const numRFPs = organization.rfps?.length || 0

    return (
        <Link
            // href={
            //     process.env.NEXT_PUBLIC_VERCEL_ENV
            //         ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/organization/${subdomain}`
            //         : `http://localhost:3000/app/organization/${subdomain}`
            // }
            href={
                isPublic
                    ? process.env.NEXT_PUBLIC_VERCEL_ENV
                        ? `https://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                        : `http://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                    : `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/organization/${subdomain}`
            }
        >
            <Card className="h-full w-full text-left flex flex-col justify-between">
                <CardHeader className="gap-2">
                    <div className="flex justify-between">
                        <Link
                            // href={
                            //     process.env.NEXT_PUBLIC_VERCEL_ENV
                            //         ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/organization/${subdomain}`
                            //         : `http://localhost:3000/app/organization/${subdomain}`
                            // }
                            href={
                                isPublic
                                    ? process.env.NEXT_PUBLIC_VERCEL_ENV
                                        ? `https://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                                        : `http://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                                    : `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/organization/${subdomain}`
                            }
                        >
                            <CardTitle className="text-xl flex flex-row gap-2 items-center">
                                <ProfilePhoto img={image} name={name} className="h-10 w-10"/>
                                {name}
                            </CardTitle>
                        </Link>
                        {!isPublic && <SaveOrganizationDialog savedOrganization={organization} type={"card"}/>}
                    </div>
                    {(moneyDeployed || numberOfPatientsEngaged) && (
                        <div className="w-full grid gap-2 grid-cols-2">
                            {moneyDeployed !== null && moneyDeployed > 0 && (
                                <div className="text-sm text-gray-700 m-0 flex items-center">
                                    <HandCoins className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>
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
                    )}
                    {description && description.trim() && (
                        <CardDescription className="text-wrap break-words line-clamp-2">
                            {truncate(description, 200)}
                        </CardDescription>
                    )}
                </CardHeader>
                {(numPlans > 0 || numProjects > 0 || numTools > 0 || numRFPs > 0) && (
                    <CardContent className="flex flex-col items-start justify-center">
                        <div className="flex flex-wrap w-full gap-4">
                            {numPlans > 0 && (
                                <PropertyBadge icon={Workflow}>
                                    <span className="flex flex-row items-center gap-x-1 whitespace-nowrap">
                                        <div className="text-sm">{numPlans}</div>
                                        {numPlans > 1 ? "Plans" : "Plan"}
                                    </span>
                                </PropertyBadge>
                            )}
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
                )}
                {Object.keys(orgCondition).length > 0 && (
                    <>
                        <Separator className="mb-4"/>
                        <CardFooter className="flex flex-col items-start space-y-2">
                            <h2 className="text-base font-semibold">
                                {orgCondition.name}
                            </h2>
                            {(associatedGenes.length > 0 || causalGenes.length > 0) && (
                                <span className="w-full flex flex-row gap-2 flex-wrap">
                                    {causalGenes.map((gene: string, index: number) => (
                                        <Badge key={index} className="text-xs flex">
                                            {gene}
                                        </Badge>
                                    ))}
                                    {associatedGenes.map((gene: string, index: number) => (
                                        <Badge key={index} className="text-xs flex">
                                            {gene}
                                        </Badge>
                                    ))}
                                </span>
                            )}
                        </CardFooter>
                    </>
                )}
            </Card>
        </Link>
    );
}
