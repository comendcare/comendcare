import {formatMoney, standardizeYear} from "@comend/lib/utils";
import type {Organization} from "@prisma/client";
import {ProfilePhoto} from "@comend/components/profile-photo";
import {Building2, Calendar, CircleDollarSign, HandCoins} from "lucide-react";
import {PAGBannerPhoto} from "@comend/components/pag-banner-photo";
import {Card} from "@comend/components/ui/card";

export default function PAGPublicProfileHeader({organization, showBackButton}: {
    organization: Partial<Organization>,
    showBackButton?: boolean
}) {

    return (
        <div className="w-full flex flex-col space-y-8">
            <Card className="pb-4 flex flex-col gap-4 overflow-hidden" data-testid="public-pag-profile-header-card">
                <PAGBannerPhoto
                    img={organization.headerImage}
                />

                <div className="w-full flex flex-col md:flex-row mx-auto px-8 gap-4 items-start">
                    <div className="h-fit w-fit -mt-16">
                        <ProfilePhoto
                            img={organization.image}
                            name={organization.name}
                            className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                            textSize="large"
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
                            {organization?.yearFounded && (
                                <div className="mt-2 flex items-center text-gray-500">
                                    <Calendar
                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                        aria-hidden="true"/>
                                    Founded
                                    in {standardizeYear(organization?.yearFounded ?? "")}
                                </div>
                            )}
                            {typeof organization?.moneyRaised === "number" && organization.moneyRaised > 0 && (
                                <div className="mt-2 flex items-center text-gray-500">
                                    <CircleDollarSign
                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                        aria-hidden="true"
                                    />
                                    {formatMoney(organization?.moneyRaised)} raised
                                </div>
                            )}
                            {typeof organization?.moneyDeployed === "number" && organization.moneyDeployed > 0 && (
                                <div className="mt-2 flex items-center text-gray-500" data-testid="raised-chip">
                                    <CircleDollarSign
                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                        aria-hidden="true"
                                    />
                                    {formatMoney(organization?.moneyDeployed)} deployed
                                </div>
                            )}
                            {/*{organization?.incorporationStatus === "YES" &&*/}
                            {/*    <div className="mt-2 flex items-center text-gray-500">*/}
                            {/*        <Building2*/}
                            {/*            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"*/}
                            {/*            aria-hidden="true"/>*/}
                            {/*        {`501(c)(3)`}*/}
                            {/*    </div>*/}
                            {/*}*/}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
