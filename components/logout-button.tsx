"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import {Button} from "@/components/ui/button";

export default function LogoutButton() {
    return (
        <Button
            variant="ghost"
            onClick={() => signOut()}
        >
            <LogOut width={18} />
        </Button>
    )
}
