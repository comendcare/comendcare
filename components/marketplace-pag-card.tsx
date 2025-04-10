import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {formatMoney, truncate} from "@/lib/utils";
import {Badge} from "./ui/badge";
import {ProfilePhoto} from "./profile-photo";
import {Separator} from "@/components/ui/separator";
import {FileText, HandCoins, Megaphone, Star, Users} from "lucide-react";
import React from "react";
import { PropertyBadge } from "./property-badge";

type NodeTypeCount = Record<string, number>;

function countPublicNodeTypes(data: { nodeType: string; private: boolean }[]): NodeTypeCount {
    return data
        .filter(item => !item.private) // Filter out private milestones
        .reduce((acc: NodeTypeCount, item) => {
            const type = item.nodeType;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
}

export function OrganizationMarketplaceCard({organization}: { organization: any }) {
    const {subdomain, image, name, description, moneyDeployed, condition} = organization;
    const orgCondition = condition?.[0]?.condition || {};
    const {associatedGenes = [], numberOfPatientsEngaged} = orgCondition;

    const nodeTypeCount = countPublicNodeTypes(organization.Milestone)
    // const nodeTypeCount = {
    //     "PROJECT": (organization.Milestone || []).filter((item: any) => !item.private).length,
    //     "ASSET": (organization.Asset || []).filter((item: any) => !item.private).length,
    //     "RFP": (organization.RFP || []).filter((item: any) => !item.private).length
    // }

    const nodeTypeLabels = [
        {key: "ASSET", icon: Star, label: "Asset"},
        {key: "RFP", icon: Megaphone, label: "RFP"},
        {key: "PROJECT", icon: FileText, label: "Project"}
    ];

    return (
        <Link
            href={
                process.env.NEXT_PUBLIC_VERCEL_ENV
                    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/organization/${subdomain}`
                    : `http://localhost:3000/app/organization/${subdomain}`
            }
        >
            <Card className="h-full w-full text-left flex flex-col justify-between">
                <CardHeader className="gap-2">
                    <CardTitle className="text-xl flex flex-row gap-2 items-center">
                        <ProfilePhoto img={image} name={name} className="h-10 w-10"/>
                        {name}
                    </CardTitle>
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
                {Object.keys(nodeTypeCount).length > 0 && (
                    <CardContent className="flex flex-col items-start justify-center">
                        <div className="flex w-full gap-4">
                            {nodeTypeLabels
                                .filter(({ key }) => nodeTypeCount[key])
                                .map(({ key, icon: Icon, label }, index) => {
                                    const count = nodeTypeCount[key];
                                    return (
                                        <PropertyBadge icon={Icon}>
                                            <span className="flex flex-row items-center gap-x-1 whitespace-nowrap">
                                                <div className="text-sm">{count}</div>{label}
                                                {count > 1 ? "s" : ""}
                                            </span>
                                        </PropertyBadge>
                                    );
                                })}
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
                            {associatedGenes.length > 0 && (
                                <span className="w-full flex flex-row gap-2 flex-wrap">
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
