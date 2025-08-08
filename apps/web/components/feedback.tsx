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
import { SidebarMenuButton, useSidebar } from "@/packages/components/ui/sidebar";
import { NavNotificationCollapsedIcon, NavNotificationExpandedIcon } from "./nav-main";

interface FeedbackProps {
    className?: string
}

export const FeedbackSheet: React.FC<FeedbackProps> = () => {
    const {state} = useSidebar()

    return (
        <Sheet>
            <SidebarMenuButton
                asChild
            >
                <SheetTrigger className="flex">
                    <div className="relative">
                        <MessageCircle className="mr-2 h-4 w-4"/>
                        {state === "collapsed" &&
                            <NavNotificationCollapsedIcon item={{title: 'Guides', url: '/app/guides'}}/>
                        }
                    </div>
                    {'Submit Feedback'}
                    {state === "expanded" &&
                        <NavNotificationExpandedIcon item={{title: 'Guides', url: '/app/guides'}}/>
                    }
                </SheetTrigger>
            </SidebarMenuButton>
            <SheetContent onOpenAutoFocus={event => event.preventDefault()}>
                <SheetHeader>
                    <SheetTitle>Send Feedback</SheetTitle>
                </SheetHeader>

                <FeedbackForm/>

            </SheetContent>
        </Sheet>
    )
}
