/* eslint-disable camelcase */
"use client"
import React from "react"
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@comend/components/ui/sheet"
import { Button } from "@comend/components/ui/button"
import FeedbackForm from "~web/components/feedback-form";
import { MessageCircle } from "lucide-react"
import { cn } from "@/packages/lib/utils";

interface FeedbackProps {
    className?: string
}

export const FeedbackSheet: React.FC<FeedbackProps> = () => {

    return (
        <Sheet>
            {/* <SheetTrigger asChild> */}
                {/* <div className="text-xs">
                    Submit feedback
                </div> */}
                <Button 
                    asChild 
                    variant="ghost"                    
                    className={cn("flex justify-start p-2")}
                    // className={cn("flex justify-start p-2", pathname.startsWith('/app/guides') ? "bg-blue-light justify-start border border-blue-dark text-primary" : "")}
                >
                    <SheetTrigger className="flex p-0 h-8">
                        <MessageCircle className="mr-2 h-4 w-4"/>
                        <p className="p-0">{'Submit Feedback'}</p>
                    </SheetTrigger>
                </Button>
            {/* </SheetTrigger> */}
            <SheetContent onOpenAutoFocus={event => event.preventDefault()}>
                <SheetHeader>
                    <SheetTitle>Send Feedback</SheetTitle>
                </SheetHeader>

                <FeedbackForm/>

            </SheetContent>
        </Sheet>
    )
}
