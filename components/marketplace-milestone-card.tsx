import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function MilestoneMarketplaceCard({ milestone }: { milestone: any }) {
    return (
        <Link
        href={"#"}
            // href={
            //     process.env.NEXT_PUBLIC_VERCEL_ENV
            //         ? `https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
            //         : `http://${organization.subdomain}.localhost:3000`
            // }
        >
        <Card className="h-full w-full text-left flex flex-col justify-between">
            <CardHeader>
                <CardTitle className="flex flex-row gap-2 items-center">
                    {milestone.name}
                </CardTitle>
                <CardDescription>{milestone.description}</CardDescription>
            </CardHeader>
            <CardContent>
            </CardContent>
        </Card>
        </Link>
    )
}