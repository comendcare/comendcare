"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {cn, nameToInitials} from "@/lib/utils";
import {faker} from "@faker-js/faker";
import {Badge} from "@/components/ui/badge";
import {Member, Organization, User} from "@prisma/client";
import Link from "next/link";
import {FaArrowUpRightFromSquare} from "react-icons/fa6";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {CalendarDays} from "lucide-react";
import {ProfilePhoto} from "./profile-photo";

export const PagProfileAboutCard = ({organization}: {
    organization: Organization & { members: (Member & { user: User })[] } | null
}) => {
    faker.seed(235)

    return (
        <Card className="organization-profile-tour-step1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    About
                </CardTitle>
                {/*<EditProfileAboutDialog/>*/}
            </CardHeader>

            <CardContent>
                <div className="flex flex-col space-y-4">
                    <div className="space-y-2">
                        <p>
                            {organization?.description}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="scroll-m-20 text-xl tracking-tight font-semibold">
                            Members
                        </h3>
                        {organization?.members ? organization?.members.map((member, index) =>
                                <div
                                    key={index}
                                    className="flex items-center space-x-4"
                                >
                                    <Avatar>
                                        <AvatarImage src={member.user.image || ""}/>
                                        <AvatarFallback>
                                            {nameToInitials(member.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">
                                            {member.user.name}
                                        </h4>
                                        {member.user.title &&
                                            <div className="flex items-center">
                                                <span className="text-xs text-muted-foreground">
                                                    {member.user.title}
                                                </span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            )
                            : <div>
                                No known members
                            </div>
                        }
                    </div>

                    <div className="space-y-2">
                        <h3 className="scroll-m-20 text-xl tracking-tight font-semibold">
                            Website
                        </h3>
                        {organization?.website &&
                            <Link
                                href={organization.website}
                                target="_blank"
                                rel="noreferrer"
                                className="w-min inline-flex flex-row justify-start items-center gap-x-2 text-base truncate rounded-md bg-stone-100 px-2 py-1 font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                            >
                                {organization?.website}
                                <FaArrowUpRightFromSquare/>
                            </Link>
                        }
                    </div>
                </div>

            </CardContent>
        </Card>
    )
};
