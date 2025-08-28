"use client"

import { useEffect } from "react"
import {SessionProvider} from "next-auth/react"
import {Toaster} from "sonner"
import {ModalProvider} from "@comend/components/modal/provider"
import {ReactFlowProvider} from "@xyflow/react"
import {MixpanelProvider} from "@comend/lib/mixpanel"
import {SettingsProvider} from "@comend/components/editor/settings"
import {NuqsAdapter} from 'nuqs/adapters/next/app'
import {OnbordaProvider} from "./components/onborda/OnbordaContext"
import {useDrainWriteQueue} from "~web/hooks/useDrainWriteQueue"
import {useWriteQueue} from "~web/state/writeQueue"
import {beaconFlush} from "~web/lib/flushOps"
import {usePathname} from "next/navigation"


export function Providers({children}: { children: React.ReactNode }) {
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
        <SessionProvider>
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
                                    {children}
                                </SettingsProvider>
                            </OnbordaProvider>
                        </MixpanelProvider>
                    </ReactFlowProvider>
                </NuqsAdapter>
            </ModalProvider>
        </SessionProvider>
    )
}
