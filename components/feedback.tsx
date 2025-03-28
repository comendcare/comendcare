/* eslint-disable camelcase */
"use client"
import React from "react"
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import FeedbackForm from "@/components/feedback-form";
import { MessageCircle } from "lucide-react"

interface FeedbackProps {
    className?: string
}

export const FeedbackSheet: React.FC<FeedbackProps> = () => {

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost">
                    <MessageCircle aria-hidden={true} />
                    Submit feedback
                </Button>
            </SheetTrigger>
            <SheetContent onOpenAutoFocus={event => event.preventDefault()}>
                <SheetHeader>
                    <SheetTitle>Send Feedback</SheetTitle>
                </SheetHeader>

                <FeedbackForm/>

            </SheetContent>
        </Sheet>
    )
}
