import {cookies} from "next/headers"
import OrganizationSettingsTab from "@/components/organization-settings-tab";
import {getSession} from "@/lib/auth"


export default async function ProfilePage() {
    const session = await getSession()
    const layout = cookies().get("react-resizable-panels:layout:platform")
    const collapsed = cookies().get("react-resizable-panels:collapsed")

    const defaultLayout = layout ? JSON.parse(layout.value) : undefined
    const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

    return (
        <main className="flex flex-col items-start w-full h-screen mx-auto p-8">
            <div className="flex flex-col space-y-8 w-full">
                <div className="space-y-2 sm:flex-auto">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Settings
                    </h1>
                    <p className="text-sm text-gray-700">
                        Platform-wide settings.
                    </p>
                </div>
                <OrganizationSettingsTab/>
            </div>
        </main>
    )
}