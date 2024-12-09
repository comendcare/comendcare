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
                    <ul role="list" className="divide-y">
                        {faker.helpers.arrayElements(assets, faker.number.int({
                            min: 2,
                            max: 5
                        })).map((asset) =>
                            <HoverCard
                                key={asset?.id}
                                openDelay={0}
                                closeDelay={0}
                            >
                                <HoverCardTrigger asChild>
                                    <a href={"#"}>
                                        <li
                                            key={asset?.id}
                                            className="w-full flex items-center justify-between space-x-4 py-2"
                                        >
                                            <div className="flex flex-col justify-start items-start min-w-0 flex-auto">
                                                <div className="flex items-center gap-x-3">
                                                    <h2 className="min-w-0 text-sm font-semibold">
                                                        <span className="truncate">{asset?.name}</span>
                                                    </h2>
                                                </div>
                                                <div className="mt-2 flex items-center gap-x-2.5 text-sm text-gray-400">
                                                    <p className="whitespace-nowrap">
                                                        {asset?.createdAt?.getFullYear()} &bull; {asset?.contacts.map((contact: any) => contact.name).join(', ')}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    </a>
                                </HoverCardTrigger>
                                <HoverCardContent
                                    side="top"
                                    className="w-80"
                                >
                                    <div className="flex justify-between space-x-4">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-semibold">{asset?.name}</h4>
                                            <p className="text-sm">
                                                {asset?.description}
                                            </p>
                                            <div className="flex items-center pt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    Created {faker.date.past().toISOString().split('T')[0]}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        )}
                    </ul>
                </div>

                <div className="flex flex-col space-y-4">
                    <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                        Projects
                    </h3>
                    <ul role="list" className="divide-y">
                        {rfps.map((rfp) =>
                            <HoverCard
                                key={rfp?.id}
                                openDelay={0}
                                closeDelay={0}
                            >
                                <HoverCardTrigger asChild>
                                    <a href={"#"}>
                                        <li
                                            key={rfp?.id}
                                            className="w-full flex items-center justify-between space-x-4 py-2"
                                        >
                                            <div className="flex flex-col justify-start items-start min-w-0 flex-auto">
                                                <div className="flex items-center gap-x-3">
                                                    <h2 className="min-w-0 text-sm font-semibold">
                                                        <span className="truncate">{rfp?.name}</span>
                                                    </h2>
                                                </div>
                                                <div className="mt-2 flex items-center gap-x-2.5 text-sm text-gray-400">
                                                    <p className="whitespace-nowrap">
                                                        {`$${rfp?.funding.toLocaleString()}`} &bull; {rfp?.contacts.map((contact: any) => contact.name).join(', ')}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* {rfp?.recency &&
                                                <div
                                                    className={cn(
                                                        // environments[rfp.recency],
                                                        'flex-none rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
                                                    )}
                                                >
                                                    {rfp?.recency}
                                                </div>
                                            } */}
                                        </li>
                                    </a>
                                </HoverCardTrigger>
                                <HoverCardContent
                                    side="top"
                                    className="w-80"
                                >
                                    <div className="flex justify-between space-x-4">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-semibold">{rfp?.name}</h4>
                                            <p className="text-sm">
                                                {rfp?.description}
                                            </p>
                                            <div className="flex items-center pt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    Created {faker.date.past().toISOString().split('T')[0]}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        )}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};
