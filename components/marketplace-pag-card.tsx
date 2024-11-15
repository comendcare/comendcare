import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FaBuildingNgo, FaCalendar, FaCircleDollarToSlot, FaGlobe, FaPeopleGroup } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { createDicebearAvatar } from "@/lib/utils";
import { Badge } from "./ui/badge";

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
        <Card className="h-full w-full text-left flex flex-col justify-between">
            <CardHeader>
                <CardTitle className="flex flex-row gap-2 items-center">
                    {/* Use the actual org images once we have them */}
                    {/* <Avatar>
                        <AvatarImage src={organization?.image} alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar> */}
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={createDicebearAvatar("", 50, 40, "identicon")}/>
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    {organization.name}
                </CardTitle>
                <CardDescription>{organization.description}</CardDescription>
            </CardHeader>
            <CardContent>
            <div
                className="mt-1 flex flex-col flex-wrap gap-4">
                {organization?.associatedGenes && organization.associatedGenes.length > 0 && (
                    <span className="w-full flex flex-row gap-2 flex-wrap">
                        {organization?.associatedGenes.map((gene: string, index: number) => (
                            <Badge key={index} className="flex text-sm">
                                {gene}
                            </Badge>
                        ))}
                    </span>
                )}
                <div className="w-full grid gap-4 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
                {organization?.numberOfIdentifiedPatients &&
                    <div className="m-0 flex items-center text-gray-500">
                        <FaPeopleGroup
                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                            aria-hidden="true"/>
                        {organization?.numberOfIdentifiedPatients}+ patients
                    </div>
                }
                {organization?.prevalenceNumerator && organization?.prevalenceDenominator &&
                    <div className="m-0 flex items-center text-gray-500">
                        <FaGlobe
                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                            aria-hidden="true"/>
                        {organization.prevalenceNumerator} of {organization?.prevalenceDenominator}
                    </div>
                }
                {organization?.moneyRaised &&
                    <div className="m-0 flex items-center text-gray-500">
                        <FaCircleDollarToSlot
                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                            aria-hidden="true"
                        />
                        ${organization?.moneyRaised?.toLocaleString()} raised
                    </div>
                }
                {organization?.incorporationStatus === 'YES' && (
                    <div className="m-0 flex items-center text-gray-500">
                        <FaBuildingNgo className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                    aria-hidden="true"/>
                        501C3
                    </div>
                )}
                {/* <div className="w-full m-0 flex items-center text-gray-500">
                    <FaCalendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                aria-hidden="true"/>
                    Founded on {new Date(organization?.createdAt ?? "").toDateString()}
                </div> */}
                </div>
            </div>
            </CardContent>
        </Card>
        </Link>
    )
}