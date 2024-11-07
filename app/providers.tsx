"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import { ModalProvider } from "@/components/modal/provider"
import { MixpanelProvider } from "./mixpanel"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <Toaster className="dark:hidden" closeButton/>
            <Toaster theme="dark" className="hidden dark:block" closeButton/>
            <ModalProvider>
            <MixpanelProvider>
                {children}
            </MixpanelProvider>
            </ModalProvider>
        </SessionProvider>
    )
}
