"use client"

import { useEffect } from "react"
import {SessionProvider} from "next-auth/react"
import {Toaster} from "sonner"
import {ModalProvider} from "@/packages/components/modal/provider"
import {ReactFlowProvider} from "@xyflow/react"
import {MixpanelProvider} from "@/packages/lib/mixpanel"
import {SettingsProvider} from "@/packages/components/editor/settings"
import {NuqsAdapter} from 'nuqs/adapters/next/app'
import {OnbordaProvider} from "../components/onborda/OnbordaContext"
import {useDrainWriteQueue} from "~web/hooks/useDrainWriteQueue"
import {useWriteQueue} from "~web/state/writeQueue"
import {beaconFlush} from "~web/lib/flushOps"
import {usePathname} from "next/navigation"
import {Session} from "next-auth";
import { TooltipProvider } from "@/packages/components/ui/tooltip"


export function Providers({children, session}: { children: React.ReactNode, session: Session | null }) {
    // useDrainWriteQueue();
    const pathname = usePathname();

    // route change → visibility often flickers; also drain now
    useEffect(() => {
        const {pending} = useWriteQueue.getState();
        if (pending.length) beaconFlush(pending);
    }, [pathname]);

    useEffect(() => {
        const onHide = () => {
            const {pending} = useWriteQueue.getState();
            if (pending.length) beaconFlush(pending);
        };
        window.addEventListener("pagehide", onHide);
        document.addEventListener("visibilitychange", onHide);
        return () => {
            window.removeEventListener("pagehide", onHide);
            document.removeEventListener("visibilitychange", onHide);
        };
    }, []);

    return (
        <SessionProvider session={session}>
            <Toaster
                className="dark:hidden"
                closeButton
            />
            <Toaster
                theme="dark"
                className="hidden dark:block"
                closeButton
                duration={5000}
            />
            <ModalProvider>
                <NuqsAdapter>
                    <ReactFlowProvider>
                        <MixpanelProvider>
                            <OnbordaProvider>
                                <SettingsProvider>
                                    <TooltipProvider delayDuration={500}>
                                    {children}
                                    </TooltipProvider>
                                </SettingsProvider>
                            </OnbordaProvider>
                        </MixpanelProvider>
                    </ReactFlowProvider>
                </NuqsAdapter>
            </ModalProvider>
        </SessionProvider>
    )
}
