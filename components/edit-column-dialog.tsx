"use client"

import {useState} from "react"
import {
    Form,
    FormControl,
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
import {Button} from "@/components/ui/button"
import {useForm} from "react-hook-form"
import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {Input} from "@/components/ui/input"
import {getNewColumnFormSchema} from "@/lib/schemas";
import { KanbanState, useKanbanStore } from "@/state/kanban/kanbanStore"
import { useShallow } from "zustand/react/shallow"
import { DropdownMenuItem } from "./ui/dropdown-menu"
import { Column } from "@prisma/client"
import { Pencil } from "lucide-react"

const kanbanSelector = (state: KanbanState) => ({
    updateColumn: state.updateColumn
})

export default function EditColumnDialog({column}: {column: Column}) {
    const { updateColumn } = useKanbanStore(useShallow(kanbanSelector))
    const [open, setOpen] = useState(false)
    const newMonitorFormSchema = getNewColumnFormSchema([])

    const form = useForm<z.infer<typeof newMonitorFormSchema>>({
        resolver: zodResolver(newMonitorFormSchema),
        mode: "onChange",
        defaultValues: {
            keyword: column.name,
        }
    })

    let keyword = form.watch("keyword")

    async function onSubmit() {
        setOpen(false)
        try {
            updateColumn(column.id, {...column, name: keyword})
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}>
                    <Pencil />
                    Edit column
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit column</DialogTitle>
                    <DialogDescription>
                        Update the properties of your column
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
                                    <FormLabel>Title</FormLabel>
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
                                onClick={() => onSubmit()}
                            >
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
