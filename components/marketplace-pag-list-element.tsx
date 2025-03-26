import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { ProfilePhoto } from "./profile-photo";
import { Building2, HandCoins, Calendar } from "lucide-react";

export function OrganizationMarketplaceListElement({ organization }: { organization: any }) {
    return (
        <Link
            href={
                process.env.NEXT_PUBLIC_VERCEL_ENV
                    ? `https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                    : `http://${organization.subdomain}.localhost:3000`
            }
        >
        <Card className="h-full w-full text-left">
            <CardHeader className="w-full">
                <CardTitle className="flex flex-row gap-2 items-center">
                    <ProfilePhoto
                        img={organization?.image}
                        name={organization?.name}
                        className="h-10 w-10"
                    />
                    {organization.name}
                </CardTitle>
                <CardDescription>{organization.description}</CardDescription>
            </CardHeader>
            <CardContent className="w-full flex flex-row gap-4 flex-wrap">
                {organization?.associatedGenes && organization.associatedGenes.length > 0 && (
                    <span className="flex flex-row gap-2 flex-wrap">
                        {organization?.associatedGenes.map((gene: string, index: number) => (
                            <Badge key={index} className="flex text-sm">
                                {gene}
                            </Badge>
                        ))}
                    </span>
                )}
                {organization?.moneyRaised !== null && organization?.moneyRaised > 0 &&
                    <div className="m-0 flex items-center text-gray-500">
                        <HandCoins
                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                            aria-hidden="true"
                        />
                        ${organization?.moneyRaised?.toLocaleString()} raised
                    </div>
                }
                {organization?.incorporationStatus === 'YES' && (
                    <div className="m-0 flex items-center text-gray-500">
                        <Building2 className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                    aria-hidden="true"/>
                        501(c)(3)
                    </div>
                )}
                {/* <div className="w-full m-0 flex items-center text-gray-500">
                    <Calendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                aria-hidden="true"/>
                    Founded on {new Date(organization?.createdAt ?? "").toDateString()}
                </div> */}
            </CardContent>
        </Card>
        </Link>
    )
}
