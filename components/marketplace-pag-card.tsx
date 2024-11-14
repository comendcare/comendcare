import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FaCalendar, FaCircleDollarToSlot, FaPeopleGroup } from "react-icons/fa6";

export function OrganizationMarketplaceCard({ organization }: { organization: any }) {
    console.log(organization)
    return (
        <Link
            href={
                process.env.NEXT_PUBLIC_VERCEL_ENV
                    ? `https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                    : `http://${organization.subdomain}.localhost:3000`
            }
        >
        <Card className="w-full max-w-[500px] text-left">
            <CardHeader>
                <CardTitle>{organization.name}</CardTitle>
                <CardDescription>{organization.description}</CardDescription>
            </CardHeader>
            <CardContent>
            <div
                className="mt-1 flex flex-col flex-wrap gap-4">
                {organization?.numberOfIdentifiedPatients &&
                    <div className="w-full m-0 flex items-center text-gray-500">
                        <FaPeopleGroup
                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                            aria-hidden="true"/>
                        {organization?.numberOfIdentifiedPatients}+ patients
                    </div>
                }
                {organization?.moneyRaised &&
                    <div className="w-full m-0 flex items-center text-gray-500">
                        <FaCircleDollarToSlot
                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                            aria-hidden="true"
                        />
                        ${organization?.moneyRaised?.toLocaleString()} raised
                    </div>
                }
                <div className="w-full m-0 flex items-center text-gray-500">
                    <FaCalendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                aria-hidden="true"/>
                    Founded on {new Date(organization?.createdAt ?? "").toDateString()}
                </div>
            </div>
            </CardContent>
        </Card>
        </Link>
    )
}