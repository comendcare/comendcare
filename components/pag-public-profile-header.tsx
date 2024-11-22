import {createDicebearAvatar} from "@/lib/utils";
import {FaCalendar, FaCircleDollarToSlot, FaPeopleGroup, FaPlus} from "react-icons/fa6";
import {Button} from "@/components/ui/button";
import {Organization} from "@prisma/client";
import PublicProfileDropdown from "@/components/public-profile-dropdown";

export default async function PAGPublicProfileHeader({organization}: { organization: Organization }) {

    return (
        <div className="w-full flex flex-col space-y-8">
            <div>
                <div>
                    <img
                        className="h-32 w-full object-cover lg:h-48"
                        src={'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'}
                        alt=""
                    />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">

                        <div className="flex">
                            <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                 src={createDicebearAvatar(organization?.createdAt.toLocaleString() ?? "", 50, 40, "identicon")}
                                 alt=""/>
                        </div>

                        <div
                            className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1"
                        >
                            <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
                                <h1 className="mt-6 min-w-0 flex-1 truncate text-2xl font-bold text-gray-900">
                                    {organization?.name}
                                </h1>
                                <div
                                    className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                                    {organization?.numberOfIdentifiedPatients &&
                                        <div className="mt-2 flex items-center text-gray-500">
                                            <FaPeopleGroup
                                                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                aria-hidden="true"/>
                                            {organization?.numberOfIdentifiedPatients}+ patients
                                        </div>
                                    }
                                    {organization?.moneyRaised &&
                                        <div className="mt-2 flex items-center text-gray-500">
                                            <FaCircleDollarToSlot
                                                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                aria-hidden="true"
                                            />
                                            ${organization?.moneyRaised?.toLocaleString()} raised
                                        </div>
                                    }
                                    <div className="mt-2 flex items-center text-gray-500">
                                        <FaCalendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                    aria-hidden="true"/>
                                        Founded on {new Date(organization?.createdAt ?? "").toDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                            <div className="flex flex-row space-x-2">
                                <Button
                                    className="gap-x-2"
                                >
                                    <FaPlus/>
                                    Follow
                                </Button>
                                <PublicProfileDropdown website={organization?.website} />
                            </div>
                        </div>

                    </div>
                    <div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">
                        <h1 className="truncate text-2xl font-bold text-gray-900">{"Hi"}</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}