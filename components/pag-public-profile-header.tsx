import {formatMoney, standardizeYear} from "@/lib/utils";
import {FaCity, FaCalendar, FaCircleDollarToSlot, FaPeopleGroup} from "react-icons/fa6";
import {Organization} from "@prisma/client";
import {ProfilePhoto} from "./profile-photo";
import {BackButton} from "./back-button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import PAGFollowButton from "@/components/pag-follow-button";

export default function PAGPublicProfileHeader({organization, showBackButton}: {
    organization: Organization,
    showBackButton?: boolean
}) {

    return (
        <div className="w-full flex flex-col space-y-8">
            <div>
                <div className="relative">
                    {showBackButton && <BackButton/>}
                    {/* <img
                        className="h-32 w-full object-cover lg:h-48"
                        src={organization?.headerImage || 'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'}
                        alt=""
                    /> */}
                    {organization?.headerImage ? (
                        <img className="h-32 w-full object-cover lg:h-48"
                            src={organization.headerImage}
                            alt=""
                        />
                    ): (
                        <div className="h-32 w-full object-cover lg:h-48 bg-secondary"></div>
                    )}
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">

                        <div className="flex">
                            <ProfilePhoto
                                img={organization?.image}
                                name={organization?.name}
                                className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                textSize="large"
                            />
                        </div>

                        <div
                            className="mt-6 sm:flex flex-row sm:flex-row sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1"
                        >
                            <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
                                <div className="mt-6 min-w-0 flex-1 truncate text-3xl font-bold text-gray-900">
                                    <HoverCard>
                                        <HoverCardTrigger asChild>
                                            <h1 className="text-wrap cursor-pointer w-full">
                                                {organization?.name}
                                            </h1>
                                        </HoverCardTrigger>
                                        <HoverCardContent
                                            side="top"
                                            className="w-fit"
                                        >
                                            <div className="space-y-2">
                                                <h4 className="text-lg font-semibold">
                                                    {organization?.name}
                                                </h4>
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                </div>
                                <div
                                    className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                                    {organization?.moneyRaised &&
                                        <div className="mt-2 flex items-center text-gray-500">
                                            <FaCircleDollarToSlot
                                                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                aria-hidden="true"
                                            />
                                            {formatMoney(organization?.moneyRaised)} raised
                                        </div>
                                    }
                                    <div className="mt-2 flex items-center text-gray-500">
                                        <FaCalendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                    aria-hidden="true"/>
                                        Founded in {standardizeYear(organization?.yearFounded ?? "")}
                                    </div>
                                    {organization?.incorporationStatus === "YES" &&
                                        <div className="mt-2 flex items-center text-gray-500">
                                            <FaCity className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                    aria-hidden="true"/>
                                            {`501(c)(3)`}
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>

                        <div
                            className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                            <div className="flex flex-row space-x-2">
                                {/*<PAGFollowButton organizationId={organization.id} />*/}
                                {/*<PublicProfileDropdown website={organization?.website}/>*/}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
