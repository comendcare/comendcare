"use client"

import { useEffect } from "react"
import {SessionProvider} from "next-auth/react"
import {Toaster} from "sonner"
import {ModalProvider} from "@comend/components/modal/provider"
import {ReactFlowProvider} from "@xyflow/react"
import {MixpanelProvider} from "@comend/lib/mixpanel"
import {SettingsProvider} from "@comend/components/editor/settings"
import {NuqsAdapter} from 'nuqs/adapters/next/app'
import {OnbordaProvider} from "../components/onborda/OnbordaContext"
import {Session} from "next-auth";
import { TooltipProvider } from "@comend/components/ui/tooltip"


export function Providers({children, session}: { children: React.ReactNode, session: Session | null }) {
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
