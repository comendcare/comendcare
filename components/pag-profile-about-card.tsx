"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {cn, nameToInitials} from "@/lib/utils";
import {faker} from "@faker-js/faker";
import {Badge} from "@/components/ui/badge";
import EditProfileAboutDialog from "@/components/edit-profile-about-dialog";
import {Member, Organization, User} from "@prisma/client";
import Link from "next/link";
import {FaArrowUpRightFromSquare} from "react-icons/fa6";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {CalendarDays} from "lucide-react";

const pag = {
    "groupName": "Myhre Syndrome Foundation",
    "description": "The Myhre Syndrome Foundation is dedicated to improving the lives of individuals affected by Myhre Syndrome, a rare genetic disorder characterized by distinctive facial features, skeletal anomalies, and developmental delays. The foundation provides support to families, promotes awareness, and funds critical research to uncover potential treatments.",
    "numberOfPatients": 150,
    "amountRaised": 350000,
    "dateJoined": "2023-01-15",
    "dateFounded": "2015-03-12",
    "topics": ["monogenic", "basic science", "gene replacement"],
    "teamMembers": [
        {
            "name": "Dr. Sarah Johnson",
            "title": "Chief Medical Officer",
            "description": "Dr. Sarah Johnson has been a medical research wizard for over 20 years and has brought her magic to the Rare Disease Foundation for the past 8 years. She’s the heartbeat of our medical team, leading us with passion and a focus on innovation and patient care.",
            "dateJoined": "2015-04-10"
        },
        {
            "name": "Michael Brown",
            "title": "Executive Director",
            "description": "Michael Brown has been steering the ship at the Rare Disease Foundation for 5 years, after 15 years of leading non-profits to success. He’s our strategic mastermind, ensuring everything runs smoothly and we stay on course.",
            "dateJoined": "2018-06-15"
        }
    ]
}

export const PagProfileAboutCard = ({organization}: { organization: Organization & { members: (Member & {user: User})[] } | null }) => {
    faker.seed(235)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    About
                </CardTitle>
                {/*<EditProfileAboutDialog/>*/}
            </CardHeader>

            <CardContent>
                <div className="flex flex-col space-y-4">
                    <div className="space-y-2">
                        <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                            Description
                        </h3>
                        <p>
                            {organization?.description}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                            Members
                        </h3>
                        {organization?.members ? organization?.members.map((member, index) =>
                                <div
                                    key={index}
                                    className="flex space-x-4"
                                >
                                    <Avatar>
                                        <AvatarImage src={member.user.image || ""}/>
                                        <AvatarFallback>
                                            {nameToInitials(member.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold">
                                            {member.user.name}
                                        </h4>
                                        <div className="flex items-center">
                                            <span className="text-xs text-muted-foreground">
                                                Joined December 2021
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                            : <div>
                                No known members
                            </div>
                        }
                    </div>

                    <div className="space-y-2">
                        <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
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
