"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Condition, Organization} from "@prisma/client";
import {Badge} from "@/components/ui/badge";
import {concat} from "lodash";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import React from "react";
import EditPAGProfileConditionCardDialog from "@/components/edit-pag-profile-condition-card-dialog";
import { Info } from "lucide-react";

export const PAGProfileConditionsCard = ({conditions, organization, showEditDialog}: { conditions: Condition[] | null, organization: Organization, showEditDialog: boolean }) => {

    if (conditions) {
        return (
            <TooltipProvider>
                <Card className="organization-profile-tour-step2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="scroll-m-20 text-2xl font-bold tracking-tight">
                            Condition
                        </CardTitle>
                        {showEditDialog &&
                            <EditPAGProfileConditionCardDialog organization={organization}/>
                        }
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
                                        {/*    <ExternalLink />*/}
                                        {/*</Link>*/}
                                    </div>
                                    <p>
                                        {condition.summary}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex flex-row items-center justify-start w-full gap-2">
                                        <h4 className="scroll-m-20 text-base font-semibold">Epidemiology</h4>
                                        <Tooltip delayDuration={0}>
                                            {/*disabled to make the tooltip unclickable*/}
                                            <TooltipTrigger disabled>
                                                <Info 
                                                    className="text-black h-4 w-4"/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    {`The number presented here are all approximate.`}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    {condition.prevalenceNumerator || condition.prevalenceDenominator || condition.numberOfPatientsEngaged ? (
                                        <ul className="flex flex-col list-disc list-inside">
                                            {condition.prevalenceNumerator && condition.prevalenceDenominator && (
                                                <li>
                                                    <span
                                                        className="font-bold">{condition.prevalenceNumerator}</span> in{" "}
                                                    <span
                                                        className="font-bold">{condition.prevalenceDenominator}</span> prevalence
                                                </li>
                                            )}
                                            {condition.numberOfPatientsEngaged && (
                                                <li>
                                                    <span
                                                        className="font-bold">{condition.numberOfPatientsEngaged}</span> patients engaged
                                                </li>
                                            )}
                                            {condition.nationalEstimatedPopulation && (
                                                <li>
                                                    <span
                                                        className="font-bold">{condition.nationalEstimatedPopulation}</span> patients
                                                    in the US
                                                </li>
                                            )}
                                            {condition.globalEstimatedPopulation && (
                                                <li>
                                                    <span
                                                        className="font-bold">{condition.globalEstimatedPopulation}</span> patients
                                                    globally
                                                </li>
                                            )}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-400">No data available.</p>
                                    )}
                                </div>


                                <div className="space-y-2">
                                    <div className="flex flex-row items-center justify-between w-full">
                                        <h4 className="scroll-m-20 text-base font-semibold">
                                            Disease categories
                                        </h4>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-2">
                                        {(() => {

                                            if (condition?.diseaseCategories.length === 0) {
                                                return (
                                                    <p className="text-gray-400">
                                                        {`No relevant badges.`}
                                                    </p>
                                                );
                                            }

                                            return (
                                                <div className="flex flex-wrap gap-1">
                                                    {condition?.diseaseCategories.map((item, index) => (
                                                        <span key={index}>
                                                            <Badge className="text-sm inline">
                                                                {item.charAt(0).toUpperCase() + item.slice(1)}
                                                            </Badge>
                                                        </span>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="flex flex-row items-center justify-between w-full">
                                        <h4 className="scroll-m-20 text-base font-semibold">
                                            Causal genes
                                        </h4>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-2">
                                        {(() => {

                                            if (condition?.causalGenes.length === 0) {
                                                return (
                                                    <p className="text-gray-400">
                                                        {`No relevant badges.`}
                                                    </p>
                                                );
                                            }

                                            return (
                                                <div className="flex flex-wrap gap-1">
                                                    {condition?.causalGenes.map((item, index) => (
                                                        <span key={index}>
                                                            <Badge className="text-sm inline">
                                                                {item.charAt(0).toUpperCase() + item.slice(1)}
                                                            </Badge>
                                                        </span>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="flex flex-row items-center justify-between w-full">
                                        <h4 className="scroll-m-20 text-base font-semibold">
                                            Associated genes
                                        </h4>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-2">
                                        {(() => {

                                            if (condition?.associatedGenes.length === 0) {
                                                return (
                                                    <p className="text-gray-400">
                                                        {`No relevant badges.`}
                                                    </p>
                                                );
                                            }

                                            return (
                                                <div className="flex flex-wrap gap-1">
                                                    {condition?.associatedGenes.map((item, index) => (
                                                        <span key={index}>
                                                            <Badge className="text-sm inline">
                                                                {item.charAt(0).toUpperCase() + item.slice(1)}
                                                            </Badge>
                                                        </span>
                                                    ))}
                                                </div>
                                            );
                                        })()}
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
            </TooltipProvider>
        )
    } else {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="scroll-m-20 text-2xl font-bold tracking-tight">
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
