"use client"

import {SessionProvider} from "next-auth/react"
import {Toaster} from "sonner"
import {ModalProvider} from "@comend/components/modal/provider"
import {ReactFlowProvider} from "@xyflow/react"
import {MixpanelProvider} from "@comend/lib/mixpanel"
import { SettingsProvider } from "@comend/components/editor/settings"
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { OnbordaProvider } from "./components/onborda/OnbordaContext"

export function Providers({children}: { children: React.ReactNode }) {
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
