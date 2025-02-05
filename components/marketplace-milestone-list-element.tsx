import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { MILESTONE_TYPE_OPTIONS } from "@/lib/types";
import { DateView } from "./miletone-date-view";

export function MilestoneMarketplaceListElement({ milestone }: { milestone: any }) {
    const startDate = milestone.startDate ? new Date(milestone.startDate) : undefined
    const endDate = milestone.endDate ? new Date(milestone.endDate) : undefined
    
    return (
        <Link
            href={'#'}
            // href={
            //     process.env.NEXT_PUBLIC_VERCEL_ENV
            //         ? `https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
            //         : `http://${organization.subdomain}.localhost:3000`
            // }
        >
        <Card className="h-full w-full text-left">
            <CardHeader className="w-full">
                <CardTitle className="flex flex-row gap-2 items-center">
                    {milestone.title}
                </CardTitle>
                <CardDescription>{milestone.description}</CardDescription>
            </CardHeader>
            <CardContent className="w-full flex flex-row gap-4 flex-wrap">
                {(milestone?.types || []).map((type: any) => (
                    <Badge className="flex text-sm">
                        {MILESTONE_TYPE_OPTIONS.find((option) => (option.value === type))?.label || "No type"}
                    </Badge>
                ))}
                
                {(startDate?.getMonth() || endDate?.getFullYear()) && (
                    <DateView startDate={startDate} endDate={endDate}/>
                )}
            </CardContent>
        </Card>
        </Link>
    )
}