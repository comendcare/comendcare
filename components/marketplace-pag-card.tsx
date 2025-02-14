import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {FaBullhorn, FaCircleDollarToSlot, FaFileLines, FaStar, FaUsers} from "react-icons/fa6";
import {formatMoney, truncate} from "@/lib/utils";
import {Badge} from "./ui/badge";
import {ProfilePhoto} from "./profile-photo";
import {Separator} from "@/components/ui/separator";
import {BookCheck, TestTube, Search} from "lucide-react";
import React from "react";

type NodeTypeCount = Record<string, number>;

function countNodeTypes(data: { node: { type: string } }[]): NodeTypeCount {
    return data.reduce((acc: NodeTypeCount, item) => {
        const type = item.node.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
}

export function OrganizationMarketplaceCard({organization}: { organization: any }) {
    const {subdomain, image, name, description, moneyDeployed, condition} = organization;
    const orgCondition = condition?.[0]?.condition || {};
    const {associatedGenes = [], numberOfPatientsEngaged} = orgCondition;

    const nodeTypeCount = countNodeTypes(organization.Milestone);

    const nodeTypeLabels = [
        {key: "ASSET", icon: FaStar, label: "Asset"},
        {key: "RFP", icon: FaBullhorn, label: "RFP"},
        {key: "PROJECT", icon: FaFileLines, label: "Project"}
    ];

    return (
        <Link
            href={
                process.env.NEXT_PUBLIC_VERCEL_ENV
                    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/organization/${subdomain}`
                    : `http://localhost:3000/app/organization/${subdomain}`
            }
        >
            <Card className="h-full w-full text-left flex flex-col justify-start">
                <CardHeader className="gap-2">
                    <CardTitle className="text-xl flex flex-row gap-2 items-center">
                        <ProfilePhoto img={image} name={name} className="h-10 w-10"/>
                        {name}
                    </CardTitle>
                    {description && description.trim() && (
                        <CardDescription className="text-wrap break-words line-clamp-2">
                            {truncate(description, 200)}
                        </CardDescription>
                    )}
                    {(moneyDeployed || numberOfPatientsEngaged) && (
                        <div className="w-full grid gap-4 grid-cols-2">
                            {moneyDeployed && (
                                <div className="m-0 flex items-center">
                                    <FaCircleDollarToSlot className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>
                                    {formatMoney(moneyDeployed)} deployed
                                </div>
                            )}
                            {numberOfPatientsEngaged && (
                                <div className="m-0 flex items-center">
                                    <FaUsers className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>
                                    {numberOfPatientsEngaged} patients
                                </div>
                            )}
                        </div>
                    )}
                </CardHeader>
                {Object.keys(nodeTypeCount).length > 0 && (
                    <CardContent className="flex flex-col items-start justify-center">
                        <div className="grid w-full gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                            {nodeTypeLabels
                                .filter(({key}) => nodeTypeCount[key])
                                .map(({key, icon: Icon, label}, index) => {
                                    const count = nodeTypeCount[key];
                                    return (
                                        <div
                                            key={key}
                                            className={`text-xs flex flex-row justify-start items-center gap-x-2
                    ${index !== 0 ? "border-l border-gray-300 pl-2" : ""}`}
                                        >
                                            <Icon className="size-4"/>
                                            {count} {label}{count > 1 ? "s" : ""}
                                        </div>
                                    );
                                })}
                        </div>
                    </CardContent>
                )}
                {Object.keys(orgCondition).length > 0 && (
                    <>
                        <Separator className="mb-4"/>
                        <CardFooter className="space-x-4">
                            <h2 className="text-base">
                                {orgCondition.name}
                            </h2>
                            {associatedGenes.length > 0 && (
                                <span className="w-full flex flex-row gap-2 flex-wrap">
                                    {associatedGenes.map((gene: string, index: number) => (
                                        <Badge key={index} className="flex text-sm">
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
