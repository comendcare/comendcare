import {cookies} from "next/headers"
import Image from "next/image"

import {Platform} from "@/components/platform"

export default function MailPage() {
    const layout = cookies().get("react-resizable-panels:layout:platform")
    const collapsed = cookies().get("react-resizable-panels:collapsed")

    const defaultLayout = layout ? JSON.parse(layout.value) : undefined
    const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

    return (
        <main className="flex flex-col items-center w-full h-screen mx-auto">
            <Platform
                defaultLayout={defaultLayout}
                defaultCollapsed={defaultCollapsed}
                navCollapsedSize={4}
            />
        </main>
    )
}