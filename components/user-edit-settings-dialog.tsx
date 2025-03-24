"use client"
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import UserEditForm from "@/components/user-edit-form";
import UserSettings from "@/components/user-settings";
import { Settings } from "lucide-react";

export default function UserEditSettingsDialog() {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="gap-x-2 w-min">
                    <Settings />
                    Settings
                </Button>
            </DialogTrigger>
            <DialogContent className="h-3/4 max-h-screen overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Edit your settings
                    </DialogTitle>
                    <DialogDescription>
                        {`You can edit your user profile's settings here.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-8">
                    <UserEditForm/>
                    <UserSettings/>
                </div>
            </DialogContent>
        </Dialog>
    )
}