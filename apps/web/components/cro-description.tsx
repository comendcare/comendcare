"use client"

import { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

export const CRODescription = ({ text }: { text: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger className="cursor-pointer text-left">
                {isExpanded ? text : <span className="line-clamp-6">{text}</span>}
            </CollapsibleTrigger>
            <CollapsibleContent className="text-left">{text}</CollapsibleContent>
        </Collapsible>
    );
};

