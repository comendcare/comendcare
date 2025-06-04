import React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getConditionsFromOrganizationId, getOrganizationFromOrganizationId } from "@/lib/fetchers";
import {PrivateBadge} from "@/components/private-badge";
import { Banknote, File, Globe, Image, Map } from "lucide-react";
import { ProfileCompletionMixpanelTrack } from "./profile-completion-track";
import {getProfileCompletionChecks} from "@/lib/utils";
import { IncorporationStatus } from "@prisma/client";

// Define the possible milestone keys explicitly
type MilestoneKey =
    | "Add website and description"
    | "Provide financial & incorporation details"
    | "Complete condition data"
    | "Upload profile image"
    | "Upload header image"
    | "Add roadmap";

interface Organization {
    website?: string;
    description?: string;
    yearFounded?: number;
    incorporationStatus?: string;
    moneyRaised?: number;
    moneyDeployed?: number;
    researchBudget?: number;
    image?: string;
    headerImage?: string;
    roadmaps?: any[];
}

interface Condition {
    description?: string;
    associatedSystems: string[];
    associatedGenes: string[];
    causalGenes: string[];
    // interestedModalities: string[];
    // therapeuticsInDevelopment: string[];
    diseaseCategories: string[];
    prevalenceNumerator: number | null;
    prevalenceDenominator: number | null;
    numberOfPatientsEngaged: number | null;
    nationalEstimatedPopulation: number | null;
    globalEstimatedPopulation: number | null;
}

const milestoneMessages: Record<MilestoneKey, { message: string; icon: JSX.Element }> = {
    "Add website and description": {
        message: "Add your organization's website and description to improve visibility.",
        icon: <Globe className="size-4" />,
    },
    "Provide financial & incorporation details": {
        message: "Provide financial and incorporation details to enhance credibility.",
        icon: <Banknote className="size-4" />,
    },
    "Complete condition data": {
        message: "Complete condition details to help researchers understand your focus.",
        icon: <File className="size-4" />,
    },
    "Upload profile image": {
        message: "Upload a profile image to personalize your organization's profile.",
        icon: <Image className="size-4" />,
    },
    "Upload header image": {
        message: "Upload a header image to make your profile more visually appealing.",
        icon: <Image className="size-4" />,
    },
    "Add roadmap": {
        message: "Add a research roadmap to showcase your planned initiatives.",
        icon: <Map className="size-4" />,
    },
};

export async function ProfileCompletionCard() {
    const session = await getSession();
    let organization: Organization | null = null;
    let conditions: Condition[] = [];

    if (session?.user.organizationId) {
        const orgResponse = await getOrganizationFromOrganizationId(session.user.organizationId, {
            id: true,
            public: true,
            verified: true,
            published: true,
            name: true,
            description: true,
            contactEmail: true,
            logo: true,
            font: true,
            image: true,
            headerImage: true,
            biopharmaConsentSettings: true,
            subdomain: true,
            customDomain: true,
            statedGoal: true,
            yearFounded: true,
            incorporationStatus: true,
            therapeuticsOfInterest: true,
            therapeuticsInDevelopment: true,
            website: true,
            moneyRaised: true,
            moneyDeployed: true,
            researchBudget: true,
            // address1                  String?
            // address2                  String?
            // formattedAddress          String?
            // city                      String?
            // region                    String?
            // postalCode                String?
            // country                   String?
            // lat                       String?
            // lng                       String?
            createdAt: true,
            updatedAt: true,
            user: true,
            userId: true,
            roadmaps: true,
            members: true,
            clients: true,
            invitations: true,
            membershipRequests: true,
            conditions: true,
            kanban: true,
            milestones: true,
            platformNotifications: true,
            reviews: true,
            savedCompanies: true,
            tools: true,
            rfps: true,
            metadata: true
        });
        if (orgResponse.success) organization = orgResponse.data as unknown as Organization;

        const condResponse = await getConditionsFromOrganizationId(session.user.organizationId, {
            id: true,
            name: true,
            slug: true,
            description: true,
            diseaseCategories: true,
            prevalenceNumerator: true,
            prevalenceDenominator: true,
            numberOfPatientsEngaged: true,
            nationalEstimatedPopulation: true,
            globalEstimatedPopulation: true,
            relevantDiseaseMechanisms: true,
            causalGenes: true,
            associatedGenes: true,
            associatedSystems: true,
            associatedSignsAndSymptoms: true,
            existingDatabasesAndStudies: true,
            toolsUnderDevelopment: true,
            createdAt: true,
            updatedAt: true,
            gardURL: true,
            nordURL: true,
            summary: true,
            prevalenceRatio: true,
            organizations: true,
            metadata: true,
        });
        if (condResponse.success) conditions = (condResponse.data ?? []) as Condition[];
    }

    const checks = getProfileCompletionChecks(organization, conditions);

    const completedMilestones = (Object.keys(checks) as MilestoneKey[]).filter(key => checks[key]);
    const incompleteMilestones = (Object.keys(checks) as MilestoneKey[]).filter(key => !checks[key]);
    const completionPercentage = (completedMilestones.length / (Object.keys(checks) as MilestoneKey[]).length) * 100;
    const orderedMilestones = [...completedMilestones, ...incompleteMilestones];

    let profileStrength = "Beginner";
    if (completionPercentage === 100) profileStrength = "Complete";
    else if (completionPercentage >= 70) profileStrength = "Advanced";
    else if (completionPercentage >= 40) profileStrength = "Intermediate";

    const firstIncompleteMilestone = incompleteMilestones[0] || "Add website and description";
    const messageData = milestoneMessages[firstIncompleteMilestone];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-normal tracking-tight">
                    Profile strength: <span className="font-bold">{profileStrength}</span>
                </CardTitle>
                <PrivateBadge/>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
                <ProfileCompletionMixpanelTrack completionPercentage={completionPercentage}/>
                <ol className="flex items-center w-full">
                    {orderedMilestones.map((milestone, index) => (
                        <li
                            key={index}
                            className={`flex w-full items-center ${
                                index < orderedMilestones.length - 1
                                    ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block"
                                    : ""
                            } ${
                                completedMilestones.includes(milestone)
                                    ? "text-blue-600 dark:text-blue-500 after:border-blue-600 dark:after:border-blue-500"
                                    : "after:border-gray-300 dark:after:border-gray-700"
                            }`}
                        >
                            <span
                                className={`flex items-center justify-center w-6 h-6 rounded-full lg:h-8 lg:w-8 shrink-0 ${
                                    completedMilestones.includes(milestone)
                                        ? "bg-blue-600 dark:bg-blue-500"
                                        : "bg-gray-300 dark:bg-gray-700"
                                }`}
                            >
                                {completedMilestones.includes(milestone) ? (
                                    <svg className="w-3 h-3 text-white" viewBox="0 0 16 12" fill="none">
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M1 5.917 5.724 10.5 15 1.5"
                                        />
                                    </svg>
                                ) : (
                                    <svg className="w-3 h-3 text-gray-500 dark:text-gray-100" viewBox="0 0 20 16" fill="currentColor">
                                        <path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Z" />
                                    </svg>
                                )}
                            </span>
                        </li>
                    ))}
                </ol>
                {profileStrength !== "Complete" &&
                    <div className="space-y-6">
                        <div className="flex flex-row items-center space-x-3 border p-4">
                            <div>{messageData.icon}</div>
                            <div>{messageData.message}</div>
                        </div>
                    </div>
                }
            </CardContent>
            {/*<CardFooter className="place-self-end">*/}
            {/*    <Button variant="cta">Complete profile</Button>*/}
            {/*</CardFooter>*/}
        </Card>
    );
}
