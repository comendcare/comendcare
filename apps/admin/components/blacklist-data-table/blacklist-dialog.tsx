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
import {addEmailToBlacklist} from "@/lib/actions";

export function BlacklistDialog() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const response = await addEmailToBlacklist(email)

            if (response.success) {
                toast.success("Successfully added email to blacklist");
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
                    <DialogTitle>Add to Blacklist</DialogTitle>
                    <DialogDescription>
                        {`Enter the email address to blacklist. Click save when you're done.`}
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
