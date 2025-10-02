"use client"

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

    return (
        <Card className="organization-profile-tour-step1" data-testid="about-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="scroll-m-20 text-2xl font-bold tracking-tight" data-testid="about-title">
                    About
                </CardTitle>
                {(organization && editable) &&
                    <EditPagProfileAboutCardDialog organization={organization} />
                }
            </CardHeader>

            <CardContent>
                <div className="flex flex-col space-y-4">
                    <div className="space-y-2">
                        <p data-testid="about-description-value">
                            {organization?.description}
                        </p>
                        <div className="max-w-full overflow-hidden" data-testid="about-website-section">
                            {(isPrivate || (!isPrivate && organization?.website)) && (
                                organization?.website ?
                                    <Link
                                        onClick={() =>
                                            mixpanelTrack("Organization Website Visited", {
                                                Website: organization.website,
                                            })
                                        }
                                        href={
                                            organization.website.startsWith("http")
                                                ? organization.website
                                                : `https://${organization.website}`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        data-testid="website-link"
                                        className="text-blue-600 underline"
                                    >
                                        {organization?.website}
                                    </Link>
                                    : (
                                        <p className="text-gray-400" data-testid="website-empty">
                                            {`No website.`}
                                        </p>
                                    )
                            )}
                        </div>
                    </div>

                    {/* on public profiles hide section if it has no contents */}
                    {(isPrivate || (!isPrivate && organization?.therapeuticsOfInterest && organization.therapeuticsOfInterest.length > 0)) && (
                        <>
                            <div className="flex flex-row items-center justify-between w-full">
                                <h4 className="scroll-m-20 text-base font-semibold" data-testid="toi-heading">
                                    Therapeutics of interest
                                </h4>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-2" data-testid="toi-section">
                                {(() => {

                                    if (organization?.therapeuticsOfInterest?.length === 0) {
                                        return (
                                            <p className="text-gray-400" data-testid="toi-empty">
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
                                <h4 className="scroll-m-20 text-base font-semibold" data-testid="tid-heading">
                                    Therapeutics in development
                                </h4>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-2" data-testid="tid-section">
                                {(() => {

                                    if (organization?.therapeuticsInDevelopment?.length === 0) {
                                        return (
                                            <p className="text-gray-400" data-testid="tid-empty">
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

                    <div className="space-y-2" data-testid="members-section">
                        <div className="flex flex-wrap justify-between items-baseline gap-x-2 gap-y-1">
                            <h4 className="scroll-m-20 text-base font-semibold">
                                Members
                            </h4>
                            {editable &&
                                <Link
                                    href="/app/settings"
                                    className="font-normal text-base hover:underline"
                                    data-testid="members-view-all-link"
                                >
                                    View all
                                </Link>
                            }
                        </div>
                        {organization?.members ? organization?.members.map((member, index) =>
                                <div
                                    key={index}
                                    className="flex items-center space-x-4"
                                    data-testid="member-item"
                                >
                                    <Avatar>
                                        <AvatarImage src={member.user.image || ""}/>
                                        <AvatarFallback>
                                            {nameToInitials(member.user.name ?? member.user.email)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold" data-testid="member-name">
                                            {member.user.name ?? member.user.email}
                                        </h4>
                                        {member.title &&
                                            <div className="flex items-center">
                                                <div className="text-xs text-muted-foreground" data-testid="member-title">
                                                    {member.title}
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                            )
                            : <p className="text-gray-400" data-testid="members-empty">
                                No known members
                            </p>
                        }
                    </div>


                </div>

            </CardContent>
        </Card>
    )
};
