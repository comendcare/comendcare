"use client"

import * as React from "react";
// Zustand store
import {useSession} from "next-auth/react";
import {useEffect} from "react";
import {useState} from "react";
import {redirect} from "next/navigation";
import Loading from "@/loading";
import {
    getAllMembershipsFromUserId,
} from "@comend/lib/fetchers";
import {toast} from "sonner";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@comend/components/ui/sidebar";
import {AppSidebar} from "~web/components/app-sidebar";
import { MembershipWithOrganization } from "@comend/lib/types";
import {MobileWarning} from "~web/components/mobile-warning";
import {useIsMobile} from "@comend/lib/hooks/use-mobile";
import {NavUser} from "~web/components/nav-user";

interface AppLayoutProps {
    children: React.ReactNode
}

export default function AppLayout({children}: AppLayoutProps) {
    const {data: session, status} = useSession()
    const [memberships, setMemberships] = useState<MembershipWithOrganization[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/login");
        }
    }, [status])

    useEffect(() => {
        if (status === "authenticated" && session) {
            getAllMembershipsFromUserId(session.user.id, {
                id: true,
                role: true,
                title: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                invitedBy: true,
                organization: true,
                organizationId: true,
                user: true,
                metadata: true
            })
                .then(response => {
                    if (response.success) {
                        setMemberships(response.data ?? []);
                    } else {
                        console.error(response.error);
                        toast.error(response.error);
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.error("Unexpected error fetching organizations.");
                });
        }
    }, [session, status]);

    const isMobile = useIsMobile()
    if (isMobile) return <>
        <MobileWarning />
    </>

    if (status === "authenticated" && session) {
        return (
            <SidebarProvider>
                <AppSidebar memberships={memberships}/>
                <SidebarInset className="w-full max-w-full overflow-hidden">
                    <header className="bg-white sticky top-0 flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 border-b bg-background w-full z-50 overflow-hidden">
                        <div className="w-full flex items-center justify-between gap-4 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <NavUser/>
                        </div>
                    </header>
                    <div className="flex h-[calc(100vh-3.5rem)] max-h-screen w-full overflow-hidden overflow-y-auto">
                        {/* {status !== "authenticated" || !session || isLoading  ? <Loading /> : (children)} */}
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    return <Loading />
}
