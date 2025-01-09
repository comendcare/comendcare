"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Condition} from "@prisma/client";
import {FaArrowUpRightFromSquare} from "react-icons/fa6";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {concat} from "lodash";

export const PAGProfileConditionsCard = ({conditions}: { conditions: Condition[] | null }) => {

    if (conditions) {
        return (
            <Card className="organization-profile-tour-step3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="scroll-m-20 text-3xl font-bold tracking-tight">
                        Condition
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {conditions.length > 0 ? conditions.map((condition: Condition) =>
                        <div
                            key={condition.id}
                            className="flex flex-col space-y-4"
                        >
                            <div className="space-y-2">
                                <div className="inline-flex flex-row justify-between items-center">
                                    {/*<Link*/}
                                    {/*    href={`http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/condition/${condition.slug}`}*/}
                                    {/*    className="hover:underline inline-flex flex-row justify-center items-center gap-x-2 text-base"*/}
                                    {/*>*/}
                                    <h3 className="scroll-m-20 text-xl tracking-tight font-semibold">
                                        {condition.name}
                                    </h3>
                                    {/*    <FaArrowUpRightFromSquare/>*/}
                                    {/*</Link>*/}
                                </div>
                                <p>
                                    {condition.summary}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex flex-row items-center justify-between w-full">
                                    <h4 className="scroll-m-20 text-base font-semibold">
                                        Statistics
                                    </h4>
                                </div>
                                <ul className="flex flex-col list-disc list-inside">
                                    <li>
                                        {`${condition.prevalenceNumerator} in ${condition.prevalenceDenominator} prevalence`}
                                    </li>
                                    <li>
                                        {`${condition.numberOfIdentifiedPatients} patients identified`}
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <div className="flex flex-row items-center justify-between w-full">
                                <h4 className="scroll-m-20 text-base font-semibold">
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
                    ) : <div className="flex flex-col space-y-2 text-left">
                        <h3 className="scroll-m-20 text-md tracking-tight font-semibold">
                            No Conditions Yet
                        </h3>
                        <p>
                            This organization is not associated with any conditions yet.
                        </p>
                    </div>
                    }
                </CardContent>
            </Card>
        )
    } else {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="scroll-m-20 text-3xl font-bold tracking-tight">
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
