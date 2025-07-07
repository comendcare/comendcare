"use client"

import {Button} from "@/packages/components/ui/button";
import {mixpanelReset, mixpanelTrack} from "@/packages/lib/mixpanel";
import {signOut} from "next-auth/react";
import {LogOut} from "lucide-react";

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
            <LogOut width={18}/>
        </Button>
    )
}
