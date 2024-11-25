"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {FaChevronRight, FaPaperclip} from "react-icons/fa6";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {faker} from "@faker-js/faker";

// Define types for statuses and environments
type Status = 'offline' | 'online' | 'error';
type Environment = 'Due' | 'New';

interface RFP {
    id: number;
    href: string;
    projectName: string;
    teamName: string;
    status: Status;
    statusText: string;
    description: string;
    environment?: Environment;
}


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

export const OpenRFPsCard = () => {

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    Assets
                </CardTitle>
            </CardHeader>

            <CardContent>
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
            </CardContent>
        </Card>
    )
};
