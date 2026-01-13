"use client"
import {PagProfileAboutCard} from "~web/components/pag-profile-about-card";
import {formatMoney, isOnboarded, setOnboarded, standardizeYear} from "@comend/lib/utils";
import {Card} from "@comend/components/ui/card";
import {PAGProfileConditionsCard} from "~web/components/pag-profile-conditions-card";
import {PAGProfileRFPsHoverableCard} from "@comend/components/pag-profile-rfps-card";
import {ProfilePhoto} from "@comend/components/profile-photo";
import {PAGBannerPhoto} from "@comend/components/pag-banner-photo";
import {RoadmapsCard} from "~web/components/public-roadmap-card";
import {Building2, Calendar, CircleDollarSign, ExternalLink, HandCoins} from "lucide-react";
import {ScrollArea} from "@comend/components/ui/scroll-area";
import {Dialog, DialogContent, DialogTrigger} from "@comend/components/ui/dialog";
import ShareDialog from "~web/components/share-dialog";
import {Button, buttonVariants} from "@comend/components/ui/button";
import {EditableProfilePhoto} from "./editable-profile-photo";
import {EditablePAGBannerPhoto} from "./editable-pag-banner-photo";
import {PAGProfileToolsCard} from "./pag-profile-tools-card";
import Link from "next/link";
import { SearchParams } from "@comend/components/types";
import dynamic from "next/dynamic";
import LoadingDots from "@comend/components/icons/loading-dots";
import type { Biosample, DiseaseModel, Tool } from "@prisma/client";
import { useEffect } from "react";
import { toast } from "sonner";
import { useOnborda } from "./onborda/OnbordaContext";

export type ToolCounts = {
    biosampleCount: number;
    diseaseModelCount: number;
    clinicalDatasetCount: number;
};

type PAGProfilePageProps = {
    organization: any;
    conditions: any[];
    roadmaps: any[];
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
    searchParams: SearchParams
    conditionTags: string[]
};


const EditPAGProfileHeaderDialog = dynamic(
    () =>
        import("~web/components/edit-pag-profile-header-dialog").then(
            (m) => m.default
        ),
    {
        ssr: false,
        loading: () => (
            <Button
                variant="ghost"
            >
                <LoadingDots color="#808080" />
            </Button>
        ),
    }
);

export default function PAGProfilePage({
    organization,
    conditions,
    roadmaps,
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
    const { startOnborda } = useOnborda()
    
    // useEffect(() => {
    //     const startOnbordaAndRemoveToast = () => {
    //         startOnborda('organization-profile-tour')
    //         setOnboarded('organization-profile-tour')
    //         toast.dismiss()
    //     }

    //     // Only start tour if user is new and is on the /app/research-plan page
    //     if (!isOnboarded('organization-profile-tour')) {
    //         toast("Welcome to Comend!", {
    //             id: "onborda",
    //             duration: 300000,
    //             position: "bottom-left",
    //             description: `Would you like to take a quick tour?`,
    //             action: (
    //                 <div className="flex flex-col space-y-2 ml-4">
    //                     <Button
    //                         onClick={() => startOnbordaAndRemoveToast()}
    //                         variant="secondary"
    //                     >
    //                         {`Yes please!`}
    //                     </Button>
    //                     <Button
    //                         onClick={() => {
    //                             toast.dismiss()
    //                             setOnboarded('organization-profile-tour')
    //                         }}
    //                         variant="ghost"
    //                     >
    //                         {`No thanks!`}
    //                     </Button>
    //                 </div>
    //             )
    //         })
    //     }
    // }, [startOnborda])

    return (
        <div className="grid grid-cols-5 px-4 w-full max-w-7xl my-4 mx-auto gap-4">
            <main className="col-span-5 flex flex-col items-center" data-testid="pag-profile-main">
                <ScrollArea id="profile-scroll-area" className="w-full flex flex-col mx-4 space-y-2">
                    <div className="w-full h-fit flex flex-col space-y-4">
                        <Card className="pb-4 flex flex-col gap-4 overflow-hidden" data-testid="pag-profile-header-card">
                            {isOwner ? (
                                <EditablePAGBannerPhoto
                                    img={organization.headerImage}
                                />
                            ) : (
                                <PAGBannerPhoto
                                    img={organization.headerImage}
                                />
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
                                            <h1 className="text-wrap text-2xl lg:text-3xl font-semibold" data-testid="org-name-heading">
                                                {organization?.name ?? "No name organization"}
                                            </h1>
                                            {/*<ComendVerifiedBadge verified={organization.verified}/>*/}
                                            <EditPAGProfileHeaderDialog organization={organization}/>
                                        </div>
                                        <div className="w-full flex flex-wrap gap-x-6">
                                            {organization?.yearFounded && (
                                                <div className="mt-2 flex items-center text-gray-500" data-testid="founded-chip">
                                                    <Calendar
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"/>
                                                    Founded
                                                    in {standardizeYear(organization?.yearFounded ?? "")}
                                                </div>
                                            )}
                                            {typeof organization?.moneyRaised === "number" && organization.moneyRaised > 0 && (
                                                <div className="mt-2 flex items-center text-gray-500" data-testid="raised-chip">
                                                    <CircleDollarSign
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"
                                                    />
                                                    {formatMoney(organization?.moneyRaised)} raised
                                                </div>
                                            )}
                                            {typeof organization?.moneyDeployed === "number" && organization.moneyDeployed > 0 && (
                                                <div className="mt-2 flex items-center text-gray-500" data-testid="raised-chip">
                                                    <CircleDollarSign
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"
                                                    />
                                                    {formatMoney(organization?.moneyDeployed)} deployed
                                                </div>
                                            )}
                                            {/*{organization?.incorporationStatus === "YES" &&*/}
                                            {/*    <div className="mt-2 flex items-center text-gray-500" data-testid="c3-chip">*/}
                                            {/*        <Building2*/}
                                            {/*            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"*/}
                                            {/*            aria-hidden="true"/>*/}
                                            {/*        {`501(c)(3)`}*/}
                                            {/*    </div>*/}
                                            {/*}*/}
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
                                                trackShareEvent={{
                                                    title: `Organization Profile Shared`,
                                                }}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-6 gap-4 pb-8">
                            <div className="relative col-span-2 space-y-4">
                                <div className="sticky top-4 space-y-4">
                                    <PAGProfileConditionsCard
                                        conditions={conditions}
                                        showEditDialog={true}
                                        isPrivate={true}
                                        conditionTags={conditionTags}
                                    />
                                    <PagProfileAboutCard
                                        organization={organization}
                                        editable={true}
                                        isPrivate={true}
                                    />
                                </div>
                            </div>
                            <div className="col-span-4 space-y-4">
                                {/*<ProfileCompletionCard*/}
                                {/*    organization={organization}*/}
                                {/*    conditions={conditions}*/}
                                {/*/>*/}
                                <div className="flex flex-col gap-4 relative">
                                    <PAGProfileRFPsHoverableCard
                                        isPrivate={true}
                                        rfps={rfps}
                                    />
                                    <RoadmapsCard roadmaps={roadmaps} organization={organization}/>
                                    {/* tools card handles it's own data state via zustand - necessary for pagination to work properly */}
                                    <PAGProfileToolsCard 
                                        organization={organization}
                                        searchParams={searchParams}
                                        toolCounts={toolCounts}
                                        biosamples={biosamples}
                                        biosamplesPageCount={biosamplesPageCount}
                                        diseaseModels={diseaseModels}
                                        diseaseModelsPageCount={diseaseModelsPageCount}
                                        clinicalDatasets={clinicalDatasets}
                                        clinicalDatasetsPageCount={clinicalDatasetsPageCount}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </main>
        </div>
    )
}

