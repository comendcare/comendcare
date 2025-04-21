import {formatMoney, standardizeYear} from "@/lib/utils";
import {Organization} from "@prisma/client";
import {ProfilePhoto} from "./profile-photo";
import {BackButton} from "./back-button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import { Building2, Calendar, HandCoins } from "lucide-react";
import { PAGBannerPhoto } from "./pag-banner-photo";

export default function PAGPublicProfileHeader({organization, showBackButton}: {
    organization: Organization,
    showBackButton?: boolean
}) {

    return (
        <div className="w-full flex flex-col space-y-8">
            <div>
                <div className="relative">
                    {showBackButton && <BackButton/>}
                    {organization?.headerImage ? (
                        <img className="h-32 w-full object-cover lg:h-48"
                            src={organization.headerImage}
                            alt=""
                        />
                    ): (
                        <div className="h-32 w-full object-cover lg:h-48 bg-secondary"></div>
                    )}
                </div>

                <div className="pb-4 flex flex-col gap-4">
                    <PAGBannerPhoto
                        img={organization.headerImage}
                        name={organization.headerImage}
                        className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                        editable={false}
                    />

                    <div className="w-full flex flex-col md:flex-row mx-auto px-8 gap-4 items-start">
                        <div className="h-fit w-fit -mt-16">
                            <ProfilePhoto
                                img={organization.image}
                                name={organization.name}
                                className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                textSize="large"
                                editable={false}
                            />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex gap-4 justify-between">
                                <h1 className="text-wrap text-2xl md:text-3xl font-semibold">
                                    {organization?.name}
                                </h1>
                                {/*<ComendVerifiedBadge verified={organization.verified}/>*/}
                            </div>
                            <div className="w-full flex flex-wrap gap-x-6">
                                {organization?.moneyRaised !== null && organization?.moneyRaised > 0 &&
                                    <div className="mt-2 flex items-center text-gray-500">
                                        <HandCoins
                                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                            aria-hidden="true"
                                        />
                                        {formatMoney(organization?.moneyRaised)} raised
                                    </div>
                                }
                                {organization?.yearFounded && (
                                    <div className="mt-2 flex items-center text-gray-500">
                                        <Calendar
                                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                            aria-hidden="true"/>
                                        Founded
                                        in {standardizeYear(organization?.yearFounded ?? "")}
                                    </div>
                                )}
                                {organization?.incorporationStatus === "YES" &&
                                    <div className="mt-2 flex items-center text-gray-500">
                                        <Building2
                                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                            aria-hidden="true"/>
                                        {`501(c)(3)`}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
