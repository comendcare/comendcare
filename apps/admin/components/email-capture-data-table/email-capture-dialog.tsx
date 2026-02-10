"use client"

import {useState} from "react"
import {Button} from "@comend/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@comend/components/ui/dialog"
import {Input} from "@comend/components/ui/input"
import {Label} from "@comend/components/ui/label"
import {toast} from "sonner";
import { addEmailToEmailCapture } from "~admin/lib/actions"

export function EmailCaptureDialog() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const response = await addEmailToEmailCapture(email)

            if (response.success) {
                toast.success("Successfully added email to email capture list");
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
                    <DialogTitle>Add to Email Capture list</DialogTitle>
                    <DialogDescription>
                        {`Enter the email address to email capture list. Click save when you're done.`}
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
