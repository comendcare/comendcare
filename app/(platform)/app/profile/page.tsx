import {cookies} from "next/headers"
import Image from "next/image"

import {Roadmap} from "@/components/roadmap"

export default function ProfilePage() {
    const layout = cookies().get("react-resizable-panels:layout:platform")
    const collapsed = cookies().get("react-resizable-panels:collapsed")

    const defaultLayout = layout ? JSON.parse(layout.value) : undefined
    const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

    return (
        <main className="flex flex-col items-center w-full h-screen mx-auto">
            <Roadmap
                defaultLayout={defaultLayout}
                defaultCollapsed={defaultCollapsed}
                navCollapsedSize={4}
            />
        </main>
    )
}