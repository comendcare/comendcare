"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {UserNewPostCard} from "@/components/user-new-post-card";
import {UserFeedTextCard} from "@/components/user-feed-text-card";
import { ExternalLink } from "lucide-react";

export const PAGProfileActivityCard = () => {
    const router = useRouter();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    Activity
                </CardTitle>
                <Button
                    variant="ghost"
                    onClick={() => router.push("/app/feed")}
                    className="inline-flex flex-row justify-center items-center gap-x-2 text-base"
                >
                    View feed
                    <ExternalLink />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <UserNewPostCard/>
                <UserFeedTextCard
                    content={"Some patients with LGMD2I or MDC1C have trouble with their breathing. To support their breathing, they get a ventilation device that they either use full-time, i.e. 24 hours a day, or only for several hours a day or at night. “Non-invasive” means that they use this device without having had an operation. Usually this means they wear a mask that can be removed at any time."}
                />
                <UserFeedTextCard
                    content={"I'm wondering if this applies to me? I can move unassisted but not without a lot of stiffness."}
                    blockquote={"Motor function describes a person’s ability to move his or her body. Sitting independently means that you can stay in the sitting position for several minutes, without being supported by either another position or stabilizing device (chair back, corset or brace)." +
                        "- I am able to run " +
                        "- I am currently able to climb stairs without assistance"}
                />
            </CardContent>
        </Card>
    );
};
