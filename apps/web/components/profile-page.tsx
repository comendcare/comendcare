"use client"
import {PagProfileAboutCard} from "~web/components/pag-profile-about-card";
import {formatMoney, standardizeYear} from "@comend/lib/utils";
import {Card} from "@comend/components/ui/card";
import {PAGProfileConditionsCard} from "~web/components/pag-profile-conditions-card";
import {PAGProfileRFPsHoverableCard} from "~web/components/pag-profile-rfps-card";
import {ProfilePhoto} from "@comend/components/profile-photo";
import {PAGBannerPhoto} from "@comend/components/pag-banner-photo";
import {RoadmapsCard} from "~web/components/public-roadmap-card";
import EditPAGProfileHeaderDialog from "~web/components/edit-pag-profile-header-dialog";
import {Building2, Calendar, ExternalLink, HandCoins} from "lucide-react";
import {ScrollArea} from "@comend/components/ui/scroll-area";
import {Dialog, DialogContent, DialogTrigger} from "@comend/components/ui/dialog";
import ShareDialog from "~web/components/share-dialog";
import {Button, buttonVariants} from "@comend/components/ui/button";
import {EditableProfilePhoto} from "./editable-profile-photo";
import {EditablePAGBannerPhoto} from "./editable-pag-banner-photo";
import {PAGProfileToolsCard} from "./pag-profile-tools-card";
import Link from "next/link";

type ToolCounts = {
    biosampleCount: number;
    diseaseModelCount: number;
    clinicalDatasetCount: number;
};

type PAGProfilePageProps = {
    organization: any;
    conditions: any[];
    roadmaps: any[];
    toolCounts: ToolCounts;
    rfps: any[];
    isOwner: boolean;
    rootDomain: string;
};

export default function PAGProfilePage({
                                           organization,
                                           conditions,
                                           roadmaps,
                                           toolCounts,
                                           rfps,
                                           isOwner,
                                           rootDomain,
                                       }: PAGProfilePageProps) {
    if (!organization) return null;
    return (
        <div className="grid grid-cols-5 px-4 w-full max-w-7xl my-4 mx-auto gap-4">
            <main className="col-span-5 flex flex-col items-center">
                <ScrollArea id="profile-scroll-area" className="w-full flex flex-col mx-4 space-y-2">
                    <div className="w-full h-fit flex flex-col space-y-4">
                        <Card className="pb-4 flex flex-col gap-4 overflow-hidden">
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
                                className="w-full flex flex-col md:flex-row mx-auto px-8 gap-4 items-start justify-between">
                                <div className="w-full flex flex-row gap-4 items-start">
                                    <div className="h-fit w-fit -mt-16">
                                        {isOwner ? (
                                            <EditableProfilePhoto
                                                img={organization.image}
                                                name={organization.name}
                                                className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                                textSize="large"
                                            />
                                        ) : (
                                            <ProfilePhoto
                                                img={organization.image}
                                                name={organization.name}
                                                className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                                textSize="large"
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex gap-4 justify-between">
                                            <h1 className="text-wrap text-2xl lg:text-3xl font-semibold">
                                                {organization?.name}
                                            </h1>
                                            {/*<ComendVerifiedBadge verified={organization.verified}/>*/}
                                            <EditPAGProfileHeaderDialog organization={organization}/>
                                        </div>
                                        <div className="w-full flex flex-wrap gap-x-6">
                                            {typeof organization?.moneyRaised === "number" && organization.moneyRaised > 0 && (
                                                <div className="mt-2 flex items-center text-gray-500">
                                                    <HandCoins
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"
                                                    />
                                                    {formatMoney(organization?.moneyRaised)} raised
                                                </div>
                                            )}
                                            {organization?.yearFounded && (
                                                <div className="mt-2 flex items-center text-gray-500">
                                                    <Calendar
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"/>
                                                    Founded
                                                    in {standardizeYear(organization?.yearFounded ?? "")}
                                                </div>
                                            )}
                                            {organization?.incorporationStatus === "YES" &&
                                                <div className="mt-2 flex items-center text-gray-500">
                                                    <Building2
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"/>
                                                    {`501(c)(3)`}
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-row space-x-2">
                                    <Link
                                        href={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                                        className={buttonVariants({variant: "secondary"})}
                                        target="_blank"
                                    >
                                        View public profile
                                    </Link>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="cta">
                                                Share public profile
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="min-w-fit">
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
                                        organization={organization}
                                        showEditDialog={true}
                                        isPrivate={true}
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
                                    {/* tools card handles it's own data state via zustand - necessary for pagination to work properly */}
                                    <PAGProfileToolsCard organizationId={organization.id} toolCounts={toolCounts}/>
                                    <RoadmapsCard roadmaps={roadmaps} organization={organization}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </main>
            {/*<Card className="col-span-1 flex flex-col space-y-4 h-fit">*/}
            {/*    <CardHeader className="flex flex-col gap-4 pb-0">*/}
            {/*        /!*<PublishOrganizationSwitch organization={organization}/>*!/*/}
            {/*        <BiopharmaConsentSwitch organization={organization}/>*/}

            {/*        <div className="flex flex-col gap-2 pb-0">*/}
            {/*            <div*/}
            {/*                className="flex flex-row items-center justify-between"*/}
            {/*            >*/}
            {/*                Public URL*/}
            {/*                <EditPagProfileSubdomainDialog organization={organization}/>*/}
            {/*            </div>*/}
            {/*            <Link*/}
            {/*                href={`http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}*/}
            {/*                target="_blank"*/}
            {/*                rel="noreferrer"*/}
            {/*                className="w-full inline-flex flex-row justify-start items-center gap-x-2 text-base truncate rounded-md bg-stone-100 px-2 py-1 font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 text-center"*/}
            {/*            >*/}
            {/*                <span className="truncate block max-w-[150px] w-full text-center overflow-hidden whitespace-nowrap">*/}
            {/*                    {organization.subdomain}.comend.io*/}
            {/*                </span>*/}
            {/*                <ExternalLink className="flex-shrink-0 h-4 w-4"/>*/}
            {/*            </Link>*/}

            {/*            <Dialog>*/}
            {/*                <DialogTrigger asChild>*/}
            {/*                    <Button variant="cta">*/}
            {/*                        Share public profile*/}
            {/*                    </Button>*/}
            {/*                </DialogTrigger>*/}
            {/*                <DialogContent className="min-w-fit">*/}
            {/*                    <ShareDialog*/}
            {/*                        url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}*/}
            {/*                        organization={organization}*/}
            {/*                        trackShareEvent={{*/}
            {/*                            title: `Organization Profile Shared`,*/}
            {/*                        }}*/}
            {/*                    />*/}
            {/*                </DialogContent>*/}
            {/*            </Dialog>*/}
            {/*        </div>*/}
            {/*    </CardHeader>*/}
            {/*    <CardContent>*/}
            {/*        <div className="flex flex-col gap-2 pb-0">*/}
            {/*            <div className="flex flex-row items-center justify-between">*/}
            {/*                Contact Email*/}
            {/*                <EditPAGContactEmailDialog organization={organization}/>*/}
            {/*            </div>*/}
            {/*            {organization.contactEmail && organization.contactEmail.trim() !== "" ?*/}
            {/*                <p className="truncate">*/}
            {/*                    {organization.contactEmail}*/}
            {/*                </p>*/}
            {/*                :*/}
            {/*                <p className="text-muted-foreground">*/}
            {/*                    No contact email set*/}
            {/*                </p>*/}
            {/*            }*/}
            {/*        </div>*/}
            {/*    </CardContent>*/}
            {/*</Card>*/}
        </div>
    )
}
