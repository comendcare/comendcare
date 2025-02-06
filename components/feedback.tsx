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
import { FaComment } from "react-icons/fa6"
import { uploadFeedbackImg } from "@/lib/g-cloud"
import FeedbackForm from "@/components/feedback-form";

interface FeedbackProps {
    className?: string
}

export const FeedbackSheet: React.FC<FeedbackProps> = () => {

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost">
                    <FaComment />
                    <span>Submit feedback</span>
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
