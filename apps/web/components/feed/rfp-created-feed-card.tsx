"use client";

import * as React from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@comend/components/ui/card";
import { Button } from "@comend/components/ui/button";
import { cn, formatDates } from "@comend/lib/utils";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { Calendar, FileText } from "lucide-react";

interface RfpCreatedProps {
    data: {
        id: string;
        title: string;
        content: {
            rfpId: string;
            deadline?: string;
        };
        orgId?: string;
        createdAt: string | Date;
    };
}

export default function RFpCreatedCard({ data }: RfpCreatedProps) {
    const createdAt = React.useMemo(() => {
        return formatDates(data.createdAt as Date);
    }, [data.createdAt]);

    const deadline = data.content.deadline
        ? formatDates(data.content.deadline as unknown as Date)
        : null;

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <ProfilePhoto
                                // optionally swap with org avatar if you store one
                                img={undefined}
                                name={data.title}
                                className="h-8 w-8 rounded-full"
                            />
                            <div className="flex flex-col">
                <span className="font-medium md:text-base">
                  New RFP Created
                </span>
                                <span className="font-light text-muted-foreground text-[0.6rem] md:text-xs leading-3">
                  {createdAt}
                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm md:text-base font-semibold">
                            {data.title}
                        </h3>

                        {deadline && (
                            <div className="flex items-center text-xs text-muted-foreground gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Deadline: {deadline}
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0">
                    <Link href={`/app/rfp/${data.content.rfpId}`} passHref>
                        <Button size="sm" variant="outline" className="flex gap-1 items-center">
                            <FileText className="h-4 w-4" />
                            View RFP
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
