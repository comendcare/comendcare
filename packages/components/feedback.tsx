/* eslint-disable camelcase */
"use client"
import React, { ReactNode } from "react"
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@comend/components/ui/sheet"
import Link from "next/link";
import FeedbackForm from "./feedback-form";

interface FeedbackProps {
    triggerButton: ReactNode,
    className?: string
}

export const FeedbackSheet: React.FC<FeedbackProps> = ({
    triggerButton,
    className,
}: {
    triggerButton: ReactNode,
    className?: string,
}) => {
    return (
        <Sheet>
            <SheetTrigger asChild className={className}>
                {triggerButton}
            </SheetTrigger>
            <SheetContent onOpenAutoFocus={event => event.preventDefault()}>
                <SheetHeader>
                    <SheetTitle>Get help or give feedback</SheetTitle>
                </SheetHeader>

                <FeedbackForm/>

                <p className="text-sm text-muted-foreground">
                    If you’d like on-going support, join our <Link href="https://join.slack.com/t/comend-community/shared_invite/zt-3knlh762v-L4f1f9aOk_BBhHe_sY9HmA" className="underline">community slack</Link>.
                </p>

            </SheetContent>
        </Sheet>
    )
}
