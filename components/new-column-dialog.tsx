"use client"
import {useState} from "react"
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
import {Button} from "@/components/ui/button"
import {useForm} from "react-hook-form"
import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {Input} from "@/components/ui/input"
import {getNewColumnFormSchema} from "@/lib/schemas";
import { KanbanState, useKanbanStore } from "@/state/kanban/kanbanStore"
import { useShallow } from "zustand/react/shallow"
import { Plus } from "lucide-react"

const kanbanSelector = (state: KanbanState) => ({
    columns: state.columns,
    addColumn: state.addColumn
})

export default function NewColumnDialog() {
    const { columns, addColumn } = useKanbanStore(useShallow(kanbanSelector))
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

    async function onSubmit(values: any) {

        setOpen(false)
        try {
            addColumn({
                name: values.keyword,
                tasks: [],
                kanbanPosition: columns.length - 1
            })
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="ml-auto">
                    <Plus />
                    Add new column
                </Button>
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
