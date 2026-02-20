"use client";

import React, {Suspense} from "react";
import {formatMoney, standardizeYear} from "@comend/lib/utils";
import {Card} from "@comend/components/ui/card";
import {ProfilePhoto} from "@comend/components/profile-photo";
import {PAGBannerPhoto} from "@comend/components/pag-banner-photo";
import {Calendar, CircleDollarSign} from "lucide-react";
import {ScrollArea} from "@comend/components/ui/scroll-area";
import {Dialog, DialogContent, DialogTrigger} from "@comend/components/ui/dialog";
import {Button, buttonVariants} from "@comend/components/ui/button";
import {EditableProfilePhoto} from "./editable-profile-photo";
import {EditablePAGBannerPhoto} from "./editable-pag-banner-photo";
import Link from "next/link";
import {SearchParams} from "@comend/components/types";
import dynamic from "next/dynamic";
import LoadingDots from "@comend/components/icons/loading-dots";
import type {Biosample, DiseaseModel, Roadmap, Tool} from "@prisma/client";
import {Skeleton} from "@comend/components/ui/skeleton";

const ShareDialog = dynamic(() => import("~web/components/share-dialog"), {
    ssr: false,
    loading: () => <LoadingDots color="#808080"/>,
});

// ---- add suspense-enabled dynamics for granular cards ----
const PAGProfileConditionsCardLazy = dynamic(
    () => import("~web/components/pag-profile-conditions-card").then((m) => m.PAGProfileConditionsCard),
    {ssr: false, suspense: true}
);

const PagProfileAboutCardLazy = dynamic(
    () => import("~web/components/pag-profile-about-card").then((m) => m.PagProfileAboutCard),
    {ssr: false, suspense: true}
);

const PAGProfileRFPsHoverableCardLazy = dynamic(
    () => import("@comend/components/pag-profile-rfps-card").then((m) => m.PAGProfileRFPsHoverableCard),
    {ssr: false, suspense: true}
);

const RoadmapsCardLazy = dynamic(
    () => import("~web/components/public-roadmap-card").then((m) => m.RoadmapsCard),
    {ssr: false, suspense: true}
);

const PAGProfileToolsCardLazy = dynamic(
    () => import("./pag-profile-tools-card").then((m) => m.PAGProfileToolsCard),
    {ssr: false, suspense: true}
);

export type ToolCounts = {
    biosampleCount: number;
    diseaseModelCount: number;
    clinicalDatasetCount: number;
};

type PAGProfilePageProps = {
    organization: any;
    conditions: any[];
    // roadmaps: any[];
    researchPlans: Roadmap[];
    researchPlansPageCount: number;
    toolCounts: ToolCounts;
    biosamples: Biosample[];
    biosamplesPageCount: number;
    diseaseModels: DiseaseModel[];
    diseaseModelsPageCount: number;
    clinicalDatasets: Tool[];
    clinicalDatasetsPageCount: number;
    rfps: any[];
    isOwner: boolean;
    rootDomain: string;
    searchParams: SearchParams;
    conditionTags: string[];
};

const EditPAGProfileHeaderDialog = dynamic(
    () => import("~web/components/edit-pag-profile-header-dialog").then((m) => m.default),
    {
        ssr: false,
        loading: () => (
            <Button variant="ghost">
                <LoadingDots color="#808080"/>
            </Button>
        ),
    }
);

export default function PAGProfilePage({
    organization,
    conditions,
    researchPlans,
    researchPlansPageCount,
    toolCounts,
    biosamples,
    biosamplesPageCount,
    diseaseModels,
    diseaseModelsPageCount,
    clinicalDatasets,
    clinicalDatasetsPageCount,
    rfps,
    isOwner,
    rootDomain,
    searchParams,
    conditionTags
}: PAGProfilePageProps) {
    return (
        <div className="grid grid-cols-5 px-4 w-full max-w-7xl my-4 mx-auto gap-4">
            <main className="col-span-5 flex flex-col items-center" data-testid="pag-profile-main">
                <ScrollArea id="profile-scroll-area" className="w-full flex flex-col mx-4 space-y-2">
                    <div className="w-full h-fit flex flex-col space-y-4">
                        <Card className="pb-4 flex flex-col gap-4 overflow-hidden"
                              data-testid="pag-profile-header-card">
                            {isOwner ? (
                                <EditablePAGBannerPhoto img={organization.headerImage}/>
                            ) : (
                                <PAGBannerPhoto img={organization.headerImage}/>
                            )}

                            <div
                                className="w-full flex flex-col md:flex-row mx-auto px-8 gap-2 items-start justify-between">
                                <div className="w-full flex flex-row gap-4 items-start">
                                    <div className="h-fit w-fit -mt-16" data-testid="avatar-image">
                                        {isOwner ? (
                                            <EditableProfilePhoto
                                                img={organization.image}
                                                name={organization.name ?? "No name organization"}
                                                className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                                textSize="large"
                                            />
                                        ) : (
                                            <ProfilePhoto
                                                img={organization.image}
                                                name={organization.name ?? "No name organization"}
                                                className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                                textSize="large"
                                            />
                                        )}
                                    </div>
                                    <div className="w-full flex flex-col">
                                        <div className="w-full flex gap-4 justify-between">
                                            <h1 className="text-wrap text-2xl lg:text-3xl font-semibold"
                                                data-testid="org-name-heading">
                                                {organization?.name ?? "No name organization"}
                                            </h1>
                                            <EditPAGProfileHeaderDialog organization={organization}/>
                                        </div>
                                        <div className="w-full flex flex-wrap gap-x-6">
                                            {organization?.yearFounded && (
                                                <div className="mt-2 flex items-center text-gray-500"
                                                     data-testid="founded-chip">
                                                    <Calendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                              aria-hidden="true"/>
                                                    Founded in {standardizeYear(organization?.yearFounded ?? "")}
                                                </div>
                                            )}
                                            {typeof organization?.moneyRaised === "number" && organization.moneyRaised > 0 && (
                                                <div className="mt-2 flex items-center text-gray-500"
                                                     data-testid="raised-chip">
                                                    <CircleDollarSign
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"/>
                                                    {formatMoney(organization?.moneyRaised)} raised
                                                </div>
                                            )}
                                            {typeof organization?.moneyDeployed === "number" && organization.moneyDeployed > 0 && (
                                                <div className="mt-2 flex items-center text-gray-500"
                                                     data-testid="raised-chip">
                                                    <CircleDollarSign
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"/>
                                                    {formatMoney(organization?.moneyDeployed)} deployed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row space-x-2">
                                    <Link
                                        href={
                                            process.env.NEXT_PUBLIC_VERCEL_ENV
                                                ? `https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                                                : `http://${organization.subdomain}.localhost:3000`
                                        }
                                        className={buttonVariants({variant: "secondary"})}
                                        target="_blank"
                                        data-testid="public-profile-link"
                                    >
                                        View public profile
                                    </Link>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="cta" data-testid="share-public-profile-btn">
                                                Share public profile
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="min-w-fit" data-testid="dialog">
                                            <ShareDialog
                                                url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                                                organization={organization}
                                                trackShareEvent={{title: `Organization Profile Shared`}}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-6 gap-4 pb-8">
                            <div className="relative col-span-2 space-y-4">
                                <div className="sticky top-4 space-y-4">
                                    <Suspense fallback={<Skeleton className="h-80 w-full rounded-md border"/>}>
                                        <PAGProfileConditionsCardLazy
                                            conditions={conditions}
                                            showEditDialog={true}
                                            isPrivate={true}
                                            conditionTags={conditionTags}
                                        />
                                    </Suspense>

                                    <Suspense fallback={<Skeleton className="h-96 w-full rounded-md border"/>}>
                                        <PagProfileAboutCardLazy organization={organization} editable={true}
                                                                 isPrivate={true}/>
                                    </Suspense>
                                </div>
                            </div>

                            <div className="col-span-4 space-y-4">
                                <div className="flex flex-col gap-4 relative">
                                    <Suspense fallback={<Skeleton className="h-40 w-full rounded-md border"/>}>
                                        <PAGProfileRFPsHoverableCardLazy
                                            isPrivate={true}
                                            rfps={rfps}
                                        />
                                    </Suspense>
                                    <Suspense fallback={<Skeleton className="h-56 w-full rounded-md border"/>}>
                                        <RoadmapsCardLazy
                                            researchPlans={researchPlans}
                                            researchPlansPageCount={researchPlansPageCount}
                                            organization={organization}
                                        />
                                    </Suspense>
                                    {/* tools card handles it's own data state via zustand - necessary for pagination to work properly */}
                                    <Suspense fallback={<Skeleton className="h-64 w-full rounded-md border"/>}>
                                        <PAGProfileToolsCardLazy
                                            organization={organization}
                                            toolCounts={toolCounts}
                                            biosamples={biosamples}
                                            diseaseModels={diseaseModels}
                                            clinicalDatasets={clinicalDatasets}
                                        />
                                    </Suspense>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </main>
        </div>
    );
}
