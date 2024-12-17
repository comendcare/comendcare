"use client"
import {useEffect, useState} from "react"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import {Button, buttonVariants} from "@/components/ui/button"
import {FaPlus} from "react-icons/fa6"
import {useForm} from "react-hook-form"
import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {toast} from "sonner"
import {Input} from "@/components/ui/input"
import {useRouter} from "next/navigation"
import {useSession} from "next-auth/react"
import {getNewColumnFormSchema} from "@/lib/schemas";
import {cn} from "@/lib/utils";
import {createKanbanColumn, createNewKanbanTask} from "@/lib/actions";
import {getKanbanFromOrganizationId} from "@/lib/fetchers";

export default function NewColumnDialog() {
    const [open, setOpen] = useState(false)
    const newMonitorFormSchema = getNewColumnFormSchema([])

    const form = useForm<z.infer<typeof newMonitorFormSchema>>({
        resolver: zodResolver(newMonitorFormSchema),
        mode: "onChange",
        defaultValues: {
            keyword: "",
            enhanced: false
        }
    })

    async function onSubmit() {

        setOpen(false)
        try {
            const response = await getKanbanFromOrganizationId()
            if (response.success && response.data) {
                await createKanbanColumn(response.data).then((response) => {
                    if (response.success && response.data) {
                        toast.success("column created successfully!");
                    } else {
                        console.error(response.error)
                        toast.error(response.error)
                    }
                })
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create task.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                className={cn(
                    buttonVariants({variant: "default"}),
                    "h-full w-6 p-1 transition ease-in-out bg-gray-200 hover:translate-x-1 hover:scale-x-105 hover:bg-black duration-300"
                )}
            >
                <FaPlus className="h-4 w-4"/>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new column</DialogTitle>
                    <DialogDescription>
                        Create a new social column by providing a keyword and
                        configuring search parameters.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="keyword"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Keyword</FormLabel>
                                    <FormDescription>
                                        {`Keywords are not case sensitive.`}
                                    </FormDescription>
                                    <FormControl>
                                        <div>
                                            <Input
                                                id="keyword"
                                                placeholder="Keyword"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={!form.formState.isValid}
                            >
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
