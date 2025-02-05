import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {FaCircleDollarToSlot, FaUsers} from "react-icons/fa6";
import {formatMoney} from "@/lib/utils";
import {Badge} from "./ui/badge";
import {ProfilePhoto} from "./profile-photo";
import {Separator} from "@/components/ui/separator";
import {BookCheck, TestTube, Search} from "lucide-react";

type NodeTypeCount = Record<string, number>;

function countNodeTypes(data: { node: { type: string } }[]): NodeTypeCount {
    return data.reduce((acc: NodeTypeCount, item) => {
        const type = item.node.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
}

export function OrganizationMarketplaceCard({organization}: { organization: any }) {
    const {subdomain, image, name, description, moneyRaised, condition} = organization;
    const orgCondition = condition?.[0]?.condition || {};
    const {associatedGenes = [], numberOfPatientsEngaged} = orgCondition;

    const nodeTypeCount = countNodeTypes(organization.Milestone);

    const nodeTypeLabels = [
        { key: "ASSET", icon: BookCheck, label: "Assets" },
        { key: "RFP", icon: Search, label: "RFPs" },
        { key: "PROJECT", icon: TestTube, label: "Projects" }
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
                    <CardTitle className="text-xl font-normal flex flex-row gap-2 items-center">
                        <ProfilePhoto img={image} name={name} className="h-10 w-10"/>
                        {name}
                    </CardTitle>
                    <div className="w-full grid gap-4 grid-cols-2">
                        {moneyRaised && (
                            <div className="m-0 flex items-center">
                                <FaCircleDollarToSlot className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>
                                {formatMoney(moneyRaised)} raised
                            </div>
                        )}
                        {numberOfPatientsEngaged && (
                            <div className="m-0 flex items-center">
                                <FaUsers className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>
                                {numberOfPatientsEngaged} patients
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-start justify-center space-y-4">
                    <div className="line-clamp-3">
                        {description}
                    </div>
                    <div className="flex flex-row space-x-2">
                        {nodeTypeLabels.map(({ key, icon: Icon, label }) => (
                        nodeTypeCount[key] ? (
                            <div
                                key={key}
                                className="text-sm w-min inline-flex flex-row justify-start items-center gap-x-2 truncate rounded-md bg-stone-100 px-2 py-1 font-medium text-stone-600 transition-colors dark:bg-stone-800 dark:text-stone-400"
                            >
                                <Icon className="size-4" />
                                {nodeTypeCount[key]} {label}
                            </div>
                        ) : null
                    ))}
                    </div>
                </CardContent>
                {Object.keys(orgCondition).length === 0 ||
                    <>
                        <Separator className="mb-4"/>
                        <CardFooter>
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
                }
            </Card>
        </Link>
    );
}
