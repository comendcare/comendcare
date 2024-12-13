"use client"

import {SessionProvider} from "next-auth/react"
import {Toaster} from "sonner"
import {ModalProvider} from "@/components/modal/provider"
import {OnbordaProvider} from "@/components/onborda/OnbordaContext"
import {ReactFlowProvider} from "@xyflow/react"
import {MixpanelProvider} from "./mixpanel"

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
            />
            <ModalProvider>
                <ReactFlowProvider>
                    <MixpanelProvider>
                        <OnbordaProvider>
                            {children}
                        </OnbordaProvider>
                    </MixpanelProvider>
                </ReactFlowProvider>
            </ModalProvider>
        </SessionProvider>
    )
}
