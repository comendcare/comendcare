import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import {Condition, Organization} from "@prisma/client";
import {Badge} from "@comend/components/ui/badge";
import React from "react";
import {formatNumberWithCommas} from "@comend/lib/utils";
import type {Prisma} from "@prisma/client";
import dynamic from "next/dynamic";
import {Button} from "@comend/components/ui/button"; // type-only; erased at build
import LoadingDots from "@comend/components/icons/loading-dots"

const EditPAGProfileConditionCardDialog = dynamic(
    () => import("~web/components/edit-pag-profile-condition-card-dialog"),
    {
        ssr: false,
        loading: () =>
            <Button variant="ghost" size="icon" aria-label="Owners only" disabled>
                <LoadingDots color="#808080" />
            </Button>
    }
);

type AssocMini = { id: string; name: string; slug: string };

type ConditionForCard = Prisma.ConditionGetPayload<{
    select: {
        id: true;
        name: true;
        slug: true;
        summary: true;
        prevalenceNumerator: true;
        prevalenceDenominator: true;
        numberOfPatientsEngaged: true;
        nationalEstimatedPopulation: true;
        globalEstimatedPopulation: true;
        diseaseCategories: true;
        associatedSystems: true;
        causalGenes: true;
        associatedGenes: true;
        associatedConditions: true; // string[]
    };
}>;


// NEW: clean + normalize badge arrays
const cleanBadges = (arr?: (string | null | undefined)[] | null) =>
    (arr ?? []).map(s => (s ?? "").trim()).filter(Boolean) as string[];

export const PAGProfileConditionsCard = ({
                                             conditions,
                                             organization,
                                             showEditDialog,
                                             isPrivate = false, // no longer affects badge-section visibility
                                         }: {
    conditions: Partial<Condition>[] | null;
    organization: Partial<Organization>;
    showEditDialog: boolean;
    isPrivate?: boolean;
}) => {
    if (conditions === null) {
        return (
            <Card data-testid="conditions-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight" data-testid="conditions-title">
                        Conditions
                    </CardTitle>
                </CardHeader>
                <CardContent data-testid="conditions-error">
                    {`We couldn't get this organization's condition information.`}
                </CardContent>
            </Card>
        );
    } else if (conditions.length === 0) {
        return (
            <Card className="organization-profile-tour-step2" data-testid="conditions-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight" data-testid="conditions-title">
                        Conditions
                    </CardTitle>
                    {showEditDialog && <EditPAGProfileConditionCardDialog organization={organization} />}
                </CardHeader>
                <CardContent data-testid="conditions-empty-state">
                    <div className="flex flex-col space-y-2 text-left">
                        <h3 className="scroll-m-20 text-md tracking-tight font-semibold">No Conditions Yet</h3>
                        <p className="text-gray-400">This organization is not associated with any conditions yet.</p>
                    </div>
                </CardContent>
            </Card>
        );
    } else {
        const condition = conditions[0] as any as ConditionForCard;

        // Cleaned arrays
        const diseaseCategories = cleanBadges(condition?.diseaseCategories);
        const associatedSystems = cleanBadges(condition?.associatedSystems);
        const causalGenes = cleanBadges(condition?.causalGenes);
        const associatedGenes = cleanBadges(condition?.associatedGenes);

        return (
            <Card className="organization-profile-tour-step2" data-testid="conditions-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight" data-testid="conditions-title">
                        {condition?.name ?? "No name condition"}
                    </CardTitle>
                    {showEditDialog && <EditPAGProfileConditionCardDialog organization={organization} />}
                </CardHeader>

                <CardContent>
                    <div key={condition?.id} className="flex flex-col space-y-4">
                        <p className="line-clamp-6" data-testid="conditions-summary">
                            {condition?.summary}
                        </p>

                        {/* Epidemiology (unchanged) */}
                        <div className="space-y-2" data-testid="epidemiology-section">
                            <div className="flex flex-row items-center justify-start w-full gap-2">
                                <h4 className="scroll-m-20 text-base font-semibold">
                                    Patient population
                                </h4>
                            </div>
                            {condition?.prevalenceNumerator ||
                            condition?.prevalenceDenominator ||
                            condition?.numberOfPatientsEngaged ? (
                                <ul className="flex flex-col list-disc list-inside">
                                    {condition?.prevalenceNumerator && condition?.prevalenceDenominator && (
                                        <li data-testid="epi-prevalence">
                                            <span className="font-semibold">{condition?.prevalenceNumerator}</span> in{" "}
                                            <span className="font-semibold">{condition?.prevalenceDenominator}</span> prevalence
                                        </li>
                                    )}
                                    {condition?.numberOfPatientsEngaged && (
                                        <li data-testid="epi-patients-engaged">
                    <span className="font-semibold">
                        {formatNumberWithCommas(condition?.numberOfPatientsEngaged.toString())}
                    </span>{" "}
                                            patients engaged
                                        </li>
                                    )}
                                    {condition?.nationalEstimatedPopulation && (
                                        <li data-testid="epi-us-population">
                    <span className="font-semibold">
                        {formatNumberWithCommas(condition?.nationalEstimatedPopulation.toString())}
                    </span>{" "}
                                            patients in the US
                                        </li>
                                    )}
                                    {condition?.globalEstimatedPopulation && (
                                        <li data-testid="epi-global-population">
                    <span className="font-semibold">
                        {formatNumberWithCommas(condition?.globalEstimatedPopulation.toString())}
                    </span>{" "}
                                            patients globally
                                        </li>
                                    )}
                                </ul>
                            ) : (
                                <p className="text-gray-400" data-testid="epi-empty">
                                    No data available.
                                </p>
                            )}
                        </div>

                        {/* Badge sections: render ONLY when there are cleaned items */}
                        {diseaseCategories.length > 0 && (
                            <div className="space-y-2" data-testid="disease-categories-section">
                                <div className="flex flex-row items-center justify-between w-full">
                                    <h4 className="scroll-m-20 text-base font-semibold" data-testid="disease-categories-heading">
                                        Disease categories
                                    </h4>
                                </div>
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                    {diseaseCategories.map((item, index) => (
                                        <Badge data-testid="categories-badge" key={`${item}-${index}`} className="text-sm">
                                            {item.charAt(0).toUpperCase() + item.slice(1)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Badge sections: render ONLY when there are cleaned items */}
                        {associatedSystems.length > 0 && (
                            <div className="space-y-2" data-testid="disease-categories-section">
                                <div className="flex flex-row items-center justify-between w-full">
                                    <h4 className="scroll-m-20 text-base font-semibold" data-testid="disease-categories-heading">
                                        Associated systems
                                    </h4>
                                </div>
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                    {associatedSystems.map((item, index) => (
                                        <Badge data-testid="categories-badge" key={`${item}-${index}`} className="text-sm">
                                            {item.charAt(0).toUpperCase() + item.slice(1)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {causalGenes.length > 0 && (
                            <div className="space-y-2" data-testid="causal-genes-section">
                                <div className="flex flex-row items-center justify-between w-full">
                                    <h4 className="scroll-m-20 text-base font-semibold" data-testid="causal-genes-heading">
                                        Causal genes
                                    </h4>
                                </div>
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                    {causalGenes.map((item, index) => (
                                        <Badge key={`${item}-${index}`} className="text-sm" data-testid="causal-gene-badge" variant={'teal'}>
                                            {item.charAt(0).toUpperCase() + item.slice(1)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {associatedGenes.length > 0 && (
                            <div className="space-y-2" data-testid="associated-genes-section">
                                <div className="flex flex-row items-center justify-between w-full">
                                    <h4 className="scroll-m-20 text-base font-semibold" data-testid="associated-genes-heading">
                                        Associated genes
                                    </h4>
                                </div>
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                    {associatedGenes.map((item, index) => (
                                        <Badge key={`${item}-${index}`} className="text-sm" data-testid="associated-gene-badge" variant={'teal'}>
                                            {item.charAt(0).toUpperCase() + item.slice(1)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!condition && (
                            <div className="flex flex-col space-y-2 text-left" data-testid="conditions-empty-state">
                                <h3 className="scroll-m-20 text-md tracking-tight font-semibold">No Conditions Yet</h3>
                                <p className="text-gray-400">This organization is not associated with any conditions yet.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }
};
