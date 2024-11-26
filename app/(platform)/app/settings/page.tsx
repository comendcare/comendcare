import {cookies} from "next/headers"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {FaUserPlus, FaUserXmark} from "react-icons/fa6";
import InviteUserToOrgDialog from "@/components/invite-user-to-org-dialog";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import OrganizationSettingsTab from "@/components/organization-settings-tab";
import {getSession} from "@/lib/auth"
import {faker} from "@faker-js/faker";
import {cn, createDicebearAvatar} from "@/lib/utils";
import {toast} from "sonner";
import {getMembersAndInvitees} from "@/lib/actions";
import Image from "next/image"
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import PAGDashboardInvitationsTab from "@/components/pag-dashboard-invitations-tab";
import PAGDashboardMembersTab from "@/components/pag-dashboard-members-tab";


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