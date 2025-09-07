// app/app/_client-shell.tsx  (Client Component)
"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@comend/components/ui/sidebar";
import { AppSidebar } from "~web/components/app-sidebar";
import { useIsMobile } from "@comend/lib/hooks/use-mobile";
import { MobileWarning } from "~web/components/mobile-warning";
import { NavUser } from "~web/components/nav-user";

export default function AppClientShell({
                                           memberships,
                                           children,
                                       }: {
    memberships: any[]; // your MembershipWithOrganization[]
    children: React.ReactNode;
}) {
    const isMobile = useIsMobile();
    if (isMobile) return <MobileWarning />;

    return (
        <SidebarProvider>
            <AppSidebar memberships={memberships} />
            <SidebarInset className="w-full max-w-full overflow-hidden">
                <header className="bg-white sticky top-0 flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 border-b bg-background w-full z-50 overflow-hidden">
                    <div className="w-full flex items-center justify-between gap-4 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <NavUser />
                    </div>
                </header>
                <div className="flex h-[calc(100vh-3.5rem)] max-h-screen w-full overflow-hidden overflow-y-auto">
                    {children}
                    {/* your OnboardingCards stays here if you like */}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
