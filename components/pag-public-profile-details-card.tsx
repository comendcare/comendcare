"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ResponsiveContainer, PieChart, Pie, Label} from "recharts";
import {cn} from "@/lib/utils";
import {faker} from "@faker-js/faker";
import {Badge} from "@/components/ui/badge";
import EditProfileAboutDialog from "@/components/edit-profile-about-dialog";
import {Organization} from "@prisma/client";
import Link from "next/link";

const milestones = [
    {text: "Identified biomarkers ", highlight: "2 years ago"},
    {text: "Mouse model created "},
    {text: "Contact registry available"},
    {text: "Natural history study ", highlight: "ongoing"},
    {text: "Gene therapy trial ", highlight: "1 month ago"},
    {text: "Patient advocacy group ", highlight: "501c3 status designated"},
    // {text: "Published in a peer-reviewed journal ", highlight: "last year"},
    // {text: "FDA orphan drug status approved"}
]

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
                        <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                            Assets
                        </h3>
                        <ul className="space-y-4 text-left text-gray-500 dark:text-gray-400">
                            {faker.helpers.arrayElements(milestones, faker.number.int({
                                min: 3,
                                max: 7
                            })).map((item, index) => (
                                <li key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <svg
                                        className="flex-shrink-0 w-3.5 h-3.5 text-green-500 dark:text-green-400"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 16 12"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M1 5.917 5.724 10.5 15 1.5"
                                        />
                                    </svg>
                                    <span>
                                        {item.text}
                                        {item.highlight && (
                                            <span
                                                className="font-semibold text-gray-900 dark:text-white">{item.highlight}</span>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
};
