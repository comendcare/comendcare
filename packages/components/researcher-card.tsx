"use client"

import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";

export const ResearcherCard = ({
    researcher, 
    showOrganization = false, 
}: { 
    researcher: any; 
    showOrganization?: boolean; 
}) => {
    return (
        <Card className="h-full w-full text-left flex flex-col">
            <CardHeader className="gap-2 relative pb-2">
                <div className="flex gap-2 items-center">
                    <CardTitle className="text-lg max-w-full truncate leading-normal">
                        {researcher.name}
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent className="h-full flex flex-col gap-4">

            </CardContent>
        </Card>
    );
};
