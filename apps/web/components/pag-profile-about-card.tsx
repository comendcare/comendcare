"use client"
import React, {useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import {isOnboarded, nameToInitials, setOnboarded} from "@comend/lib/utils";
import {Member, Organization, User} from "@prisma/client";
import Link from "next/link";
import {Avatar, AvatarFallback, AvatarImage} from "@comend/components/ui/avatar";
import EditPagProfileAboutCardDialog from "~web/components/edit-pag-profile-about-card-dialog";
import {ExternalLink} from "lucide-react";
import {Badge} from "@comend/components/ui/badge";
import {mixpanelTrack} from "@comend/lib/mixpanel";

export const PagProfileAboutCard = ({organization, editable, isPrivate = false}: {
    organization: Partial<Organization> & { members: (Member & { user: User })[] } | null
    editable: boolean
    isPrivate?: boolean
}) => {
    // const {startOnborda} = useOnborda()
    // const pathname = usePathname();

    // const startOnbordaAndRemoveToast = () => {
    //     startOnborda('organization-profile-tour')
    //     setOnboarded('organization-profile-tour')
    //     toast.dismiss()
    // }

    // useEffect(() => {
    //     // Only start tour if user is new and is on the /app/profile page
    //     if (pathname === "/app/profile" && !isOnboarded('organization-profile-tour')) {
    //         toast("Welcome to Comend!", {
    //             id: "onborda",
    //             duration: 300000,
    //             description: `Would you like to take a quick tour?`,
    //             action: (
    //                 <div className="flex flex-col space-y-2 ml-4">
    //                     <Button
    //                         onClick={startOnbordaAndRemoveToast}
    //                         variant="secondary"
    //                     >
    //                         {`Yes please!`}
    //                     </Button>
    //                     <Button
    //                         onClick={() => {
    //                             toast.dismiss()
    //                             setOnboarded('organization-profile-tour')
    //                         }}
    //                         variant="ghost"
    //                     >
    //                         {`No thanks!`}
    //                     </Button>
    //                 </div>
    //             )
    //         })
    //     }
    // }, [pathname, startOnbordaAndRemoveToast])

    return (
        <Card className="organization-profile-tour-step1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="scroll-m-20 text-2xl font-bold tracking-tight">
                    About
                </CardTitle>
                {(organization && editable) &&
                    <EditPagProfileAboutCardDialog organization={organization}/>
                }
            </CardHeader>

            <CardContent>
                <div className="flex flex-col space-y-4">
                    <div className="space-y-2">
                        <p>
                            {organization?.description}
                        </p>
                        <div className="max-w-full overflow-hidden">
                            {(isPrivate || (!isPrivate && organization?.website)) && (
                                organization?.website ?
                                    <Link
                                        onClick={() => mixpanelTrack("Organization Website Visited", {
                                            "Website": organization.website
                                        })}
                                        href={organization.website.startsWith("http")
                                            ? organization.website
                                            : `https://${organization.website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-min inline-flex flex-row justify-start items-center gap-x-2 text-base truncate rounded-md bg-stone-100 px-2 py-1 font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                                    >
                                        <span
                                            className="truncate block max-w-[180px] overflow-hidden whitespace-nowrap">
                                            {organization?.website}
                                        </span>
                                        <ExternalLink className="h-4 w-4"/>
                                    </Link>
                                    : (
                                        <p className="text-gray-400">
                                            {`No website.`}
                                        </p>
                                    )
                            )}
                        </div>
                        {/*<div className="max-w-full overflow-hidden">*/}
                        {/*    {(isPrivate || (!isPrivate && organization?.website)) && (*/}
                        {/*        organization?.website ?*/}
                        {/*            <Link*/}
                        {/*                onClick={() => mixpanelTrack("Organization Website Visited", {*/}
                        {/*                    "Website": organization.website*/}
                        {/*                })}*/}
                        {/*                href={organization.website.startsWith("http")*/}
                        {/*                    ? organization.website*/}
                        {/*                    : `https://${organization.website}`}*/}
                        {/*                target="_blank"*/}
                        {/*                rel="noreferrer"*/}
                        {/*                className="w-min inline-flex flex-row justify-start items-center gap-x-2 text-base truncate rounded-md bg-stone-100 px-2 py-1 font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"*/}
                        {/*            >*/}
                        {/*            <span className="truncate block max-w-[180px] overflow-hidden whitespace-nowrap">*/}
                        {/*                {organization?.website}*/}
                        {/*            </span>*/}
                        {/*                <ExternalLink className="h-4 w-4"/>*/}
                        {/*            </Link>*/}
                        {/*            : (*/}
                        {/*                <p className="text-gray-400">*/}
                        {/*                    {`No website.`}*/}
                        {/*                </p>*/}
                        {/*            )*/}
                        {/*    )}*/}
                        {/*</div>*/}
                    </div>

                    {/* on public profiles hide section if it has no contents */}
                    {(isPrivate || (!isPrivate && organization?.therapeuticsOfInterest && organization.therapeuticsOfInterest.length > 0)) && (
                        <>
                            <div className="flex flex-row items-center justify-between w-full">
                                <h4 className="scroll-m-20 text-base font-semibold">
                                    Therapeutics of interest
                                </h4>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-2">
                                {(() => {

                                    if (organization?.therapeuticsOfInterest?.length === 0) {
                                        return (
                                            <p className="text-gray-400">
                                                {`No relevant badges.`}
                                            </p>
                                        );
                                    }

                                    return (
                                        <div className="flex flex-wrap gap-1">
                                            {organization?.therapeuticsOfInterest?.map((item, index) => (
                                                <Badge data-testid="toi-badge" key={index} className="text-sm">
                                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                                </Badge>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </>
                    )}

                    {(isPrivate || (!isPrivate && organization?.therapeuticsInDevelopment && organization.therapeuticsInDevelopment.length > 0)) && (
                        <>
                            <div className="flex flex-row items-center justify-between w-full">
                                <h4 className="scroll-m-20 text-base font-semibold">
                                    Therapeutics in development
                                </h4>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-2">
                                {(() => {

                                    if (organization?.therapeuticsInDevelopment?.length === 0) {
                                        return (
                                            <p className="text-gray-400">
                                                {`No relevant badges.`}
                                            </p>
                                        );
                                    }

                                    return (
                                        <div className="flex flex-wrap gap-1">
                                            {organization?.therapeuticsInDevelopment?.map((item, index) => (
                                                <Badge data-testid="tid-badge" key={index} className="text-sm">
                                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                                </Badge>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <div className="flex flex-wrap justify-between items-baseline gap-x-2 gap-y-1">
                            <h4 className="scroll-m-20 text-base font-semibold">
                                Members
                            </h4>
                            {editable &&
                                <Link
                                    href="/app/settings"
                                    className="font-normal text-base hover:underline"
                                >
                                    View all
                                </Link>
                            }
                        </div>
                        {organization?.members ? organization?.members.map((member, index) =>
                                <div
                                    key={index}
                                    className="flex items-center space-x-4"
                                >
                                    <Avatar>
                                        <AvatarImage src={member.user.image || ""}/>
                                        <AvatarFallback>
                                            {nameToInitials(member.user.name ?? member.user.email)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">
                                            {member.user.name ?? member.user.email}
                                        </h4>
                                        {member.title &&
                                            <div className="flex items-center">
                                                <div className="text-xs text-muted-foreground">
                                                    {member.title}
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                            )
                            : <p className="text-gray-400">
                                No known members
                            </p>
                        }
                    </div>


                </div>

            </CardContent>
        </Card>
    )
};
