"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {Condition} from "@prisma/client";
import {FaArrowUpRightFromSquare} from "react-icons/fa6";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {concat} from "lodash";

export const PAGProfileConditionsCard = ({conditions}: { conditions: Condition[] | null }) => {
    const router = useRouter();

    if (conditions) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                        Conditions
                    </CardTitle>

                </CardHeader>

                <CardContent>
                    {conditions.map((condition: Condition) =>
                        <div
                            key={condition.id}
                            className="flex flex-col space-y-4"
                        >
                            <div className="space-y-2">
                                <div className="inline-flex flex-row justify-between items-center">
                                    <Link
                                        href={"/app/roadmap"}
                                        className="hover:underline inline-flex flex-row justify-center items-center gap-x-2 text-base"
                                    >
                                        <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                            {condition.name}
                                        </h3>
                                        <FaArrowUpRightFromSquare/>
                                    </Link>
                                </div>
                                <p>
                                    {condition.summary}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex flex-row items-center justify-between w-full">
                                    <h4 className={cn("scroll-m-20 text-base font-semibold")}>
                                        Relevant signs and symptoms
                                    </h4>
                                </div>
                                <ul className="flex flex-col list-disc list-inside">
                                    {condition?.associatedSignsAndSymptoms.map((item, index) =>
                                        <li key={index}>
                                            {item}
                                        </li>
                                    )}
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <div className="flex flex-row items-center justify-between w-full">
                                    <h4 className={cn("scroll-m-20 text-base font-semibold")}>
                                        Relevant topics
                                    </h4>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-1">
                                    {concat(condition?.diseaseCategories, condition?.interestedModalities, condition?.relevantDiseaseMechanisms, condition?.associatedGenes).map((item, index) =>
                                        <Badge key={index} className="flex text-sm">
                                            {item.charAt(0).toUpperCase() + item.slice(1)}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    } else {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                        Conditions
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {`We couldn't get this organization's condition information.`}
                </CardContent>
            </Card>
        )
    }
}
