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
import {toast} from "sonner";
import { addEmailToEmailCapture } from "~admin/lib/actions"
import { emailCaptureFormSchema } from "@comend/lib/types"
import { Form, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@comend/components/ui/form"

export function EmailCaptureDialog() {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof emailCaptureFormSchema>>({
        mode: "onChange",
        reValidateMode: "onChange",
        resolver: zodResolver(emailCaptureFormSchema),
        defaultValues: {email: undefined}
    });

    const handleSubmit = async (values: z.infer<typeof emailCaptureFormSchema>) => {
        setLoading(true)
        try {
            const response = await addEmailToEmailCapture(values.email)

            if (response.success) {
                toast.success("Successfully added email to email capture list")
            } else {
                toast.error(response.error || "An error occurred while adding email.")
            }
        } catch (error) {
            console.error("Feedback error:", error)
            toast.error("An error occurred while adding email.")
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
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((values) => handleSubmit(values))}>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem className="w-full flex gap-4 items-center">
                                    <FormLabel htmlFor="email" className="text-right">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            id="email"
                                            placeholder="example@email.com"
                                            className="col-span-3"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button 
                                type="submit" 
                                disabled={loading || !form.formState.isValid}
                            >
                                {loading ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
