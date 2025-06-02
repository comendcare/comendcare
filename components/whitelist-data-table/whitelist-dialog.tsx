"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {toast} from "sonner";
import {addEmailToWhitelist} from "@/lib/actions";

export function WhitelistDialog() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const response = await addEmailToWhitelist(email)

            if (response.success) {
                toast.success("Successfully added email to whitelist");
            } else {
                toast.error(response.error || "An error occurred while adding email.");
            }
        } catch (error) {
            console.error("Feedback error:", error);
            toast.error("An error occurred while adding email.");
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    Add Email
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add to Whitelist</DialogTitle>
                    <DialogDescription>
                        {`Enter the email address to whitelist. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <Label htmlFor="email" className="text-right">
                        Email
                    </Label>
                    <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="col-span-3"
                    />
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSubmit} disabled={loading || !email}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
