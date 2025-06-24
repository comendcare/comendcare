"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import {Button} from "@/components/ui/button";
import mixpanel from "mixpanel-browser";
import { mixpanelReset, mixpanelTrack } from "@/mixpanel";

export default function LogoutButton() {
    return (
        <Button
            variant="ghost"
            onClick={() => {
                mixpanelTrack('User Logout')
                mixpanelReset()
                signOut()
            }}
            className="transition-all duration-150 ease-in-out hover:bg-stone-200 active:bg-stone-300 dark:text-white dark:hover:bg-stone-700 dark:active:bg-stone-800"
        >
            <LogOut width={18} />
        </Button>
    )
}
