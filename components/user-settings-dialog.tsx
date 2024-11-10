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
import {FaGear, FaUserPlus} from "react-icons/fa6";
import UserOnboardingForm from "@/components/user-onboarding-form";

export default function UserSettingsDialog() {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="gap-x-2">
                    <FaGear/>
                    Settings
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit your settings
                    </DialogTitle>
                    <DialogDescription>
                        {`You can edit your user profile's settings here.`}
                    </DialogDescription>
                </DialogHeader>

                <UserOnboardingForm/>
            </DialogContent>
        </Dialog>
    )
}