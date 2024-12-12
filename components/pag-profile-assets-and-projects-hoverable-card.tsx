"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {FaArrowUpRightFromSquare, FaChevronRight, FaPaperclip, FaPen} from "react-icons/fa6";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {faker} from "@faker-js/faker";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import { AssetDetails } from "./asset-details";
import { RFPDetails } from "./rfp-details.tsx";

// Define types for statuses and environments
type Recency = 'Due' | 'New';

const environments: Record<Recency, string> = {
    Due: 'text-red-400 bg-red-400/10 ring-red-400/20',
    New: 'text-green-400 bg-green-400/10 ring-green-400/30',
};

export const PAGProfileAssetsAndProjectsHoverableCard = ({ assets, rfps }: { assets: any[], rfps: any[] }) => {
    faker.seed(123)
    const router = useRouter();

    return (
        <Card className="organization-profile-tour-step4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    Milestones
                </CardTitle>
                <Button
                    variant="ghost"
                    onClick={() => router.push("/app/roadmap")}
                    className="inline-flex flex-row justify-center items-center gap-x-2 text-base"
                >
                    Edit research plan
                    <FaArrowUpRightFromSquare/>
                </Button>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-4">
                    <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                        Assets
                    </h3>
                    {assets.length > 0 ? (
                        <ul role="list" className="divide-y">
                            {faker.helpers.arrayElements(assets, faker.number.int({
                                min: 2,
                                max: 5
                            })).map((asset) =>
                                <AssetDetails asset={asset}/>
                            )}
                        </ul>
                    ): (
                        <p className="text-gray-400">No assets to show.</p>
                    )}
                </div>

                <div className="flex flex-col space-y-4">
                    <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                        Projects
                    </h3>
                    {rfps.length > 0 ? (
                        <ul role="list" className="divide-y">
                            {rfps.map((rfp) =>
                                <RFPDetails rfp={rfp}/>
                            )}
                        </ul>
                    ): (
                        <p className="text-gray-400">No projects to show.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
