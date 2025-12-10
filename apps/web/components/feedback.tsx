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
import FeedbackForm from "~web/components/feedback-form";
import { MessageCircle } from "lucide-react"
import { SidebarMenuButton, useSidebar } from "@comend/components/ui/sidebar";
import { NavNotificationCollapsedIcon, NavNotificationExpandedIcon } from "./nav-main";
import Link from "next/link";

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
                    {'Message a team member'}
                    {state === "expanded" &&
                        <NavNotificationExpandedIcon item={{title: 'Guides', url: '/app/guides'}}/>
                    }
                </SheetTrigger>
            </SidebarMenuButton>
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
