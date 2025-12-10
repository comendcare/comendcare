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
import { MessageCircle } from "lucide-react"
// import { SidebarMenuButton, useSidebar } from "@comend/components/ui/sidebar";
// import { NavNotificationCollapsedIcon, NavNotificationExpandedIcon } from "./nav-main";
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
    // const {state} = useSidebar()

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

                {/* <p className="text-sm text-muted-foreground">
                    If you’d like on-going support, join our <Link href="" className="underline">community slack</Link>.
                </p> */}

            </SheetContent>
        </Sheet>
    )
}
