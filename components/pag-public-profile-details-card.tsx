"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ResponsiveContainer, PieChart, Pie, Label} from "recharts";
import {cn} from "@/lib/utils";
import {faker} from "@faker-js/faker";
import {Badge} from "@/components/ui/badge";
import {Organization} from "@prisma/client";
import Link from "next/link";

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

export const PAGPublicProfileDetailsCard = ({organization}: { organization: Organization | null }) => {
    faker.seed(235)
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    About
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col space-y-4">
                    <div className="flex-shrink-0 space-y-4">
                        <div className="flex-grow space-y-4">
                            <div className="space-y-2">
                                <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                    Description
                                </h3>
                                <p>
                                    {organization?.description}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex flex-row items-center justify-between w-full">
                                    <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                        Relevant topics
                                    </h3>
                                    <Link
                                        href="/condition"
                                        className="hover:underline"
                                    >
                                        See more
                                    </Link>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-1">
                                    {pag?.topics.map((item, index) =>
                                        <Badge key={index} className="flex text-sm">
                                            {item.charAt(0).toUpperCase() + item.slice(1)}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
};
