import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { useDndContext } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useMemo } from "react"
import { Task, TaskCard } from "@/components/task-card"
import { cva } from "class-variance-authority"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "./ui/button"
import { Ellipsis, GripVertical, Trash } from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import {Column} from "@prisma/client";
import NewKanbanTaskButton from "@/components/new-kanban-task-button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { KanbanState, useKanbanStore } from "@/state/kanban/kanbanStore"
import { useShallow } from "zustand/react/shallow"
import EditColumnDialog from "./edit-column-dialog"
import { useSession } from "next-auth/react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type ColumnType = "Column"

export interface ColumnDragData {
    type: ColumnType
    column: Column
}

interface BoardColumnProps {
    column: Column
    tasks: Task[]
    isOverlay?: boolean
    filter?: string,
    mountKey: number
}

const selector = (state: KanbanState) => ({
    deleteColumn: state.deleteColumn
})

export function BoardColumn({ column, tasks, isOverlay, filter, mountKey }: BoardColumnProps) {
    const {data: session} = useSession()
    const {deleteColumn} = useKanbanStore(useShallow(selector))
    const tasksIds = useMemo(() => {
        return tasks.map(task => task.id)
    }, [tasks])

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column
        } satisfies ColumnDragData,
        attributes: {
            roleDescription: `Column: ${column.name}`
        }
    })

    const style = {
        transition,
        transform: CSS.Translate.toString(transform)
    }

    const variants = cva(
        "h-min w-[350px] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center",
        {
            variants: {
                dragging: {
                    default: "border-2 border-transparent",
                    over: "ring-2 opacity-30",
                    overlay: "ring-2 ring-primary"
                }
            }
        }
    )

    async function handleDelete () {
        try {
            deleteColumn(column.id, session?.user?.organizationId)
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(
                variants({
                    dragging: isOverlay
                        ? "overlay"
                        : isDragging
                        ? "over"
                        : undefined
                }),
            )}
        >
            <CardHeader className={cn(
                "p-2 font-semibold text-left flex flex-row space-between items-center rounded-t-lg"
            )}>
                <CardTitle className="w-full flex flex-row justify-between space-between items-center">
                    <div className="flex gap-4 items-center">
                        <Button
                            variant="ghost"
                            {...attributes}
                            {...listeners}
                            className=" p-1 -ml-2 h-auto cursor-grab relative"
                        >
                            <span className="sr-only">{`Move column: ${column.name}`}</span>
                            <GripVertical />
                        </Button>
                        <h1 className="text-xl">{column.name}</h1>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                                <Ellipsis />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <EditColumnDialog column={column}/>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <Trash />
                                        Delete column
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will delete all the tasks in this column.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction asChild>
                                            <Button
                                                variant="destructive"
                                                onClick={handleDelete}
                                            >
                                                Confirm
                                            </Button>
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardTitle>
            </CardHeader>
            <ScrollArea className="h-full">
                <CardContent className="rounded-b-md flex flex-grow flex-col gap-2 p-2">
                    <SortableContext items={tasksIds}>
                        {tasks.map(task => (
                            <TaskCard key={task.id} task={task} mountKey={mountKey}/>
                        ))}
                    </SortableContext>
                    <NewKanbanTaskButton orgId={session?.user?.organizationId} column={column} assignTo={session?.user?.id && filter === 'personal' ? session.user.id : undefined}/>
                </CardContent>
            </ScrollArea>
        </Card>
    )
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
    const dndContext = useDndContext()

    const variations = cva("h-full flex lg:justify-center", {
        variants: {
            dragging: {
                default: "snap-x snap-mandatory",
                active: "snap-none"
            }
        }
    })

    return (
        // <ScrollArea
        //     className={variations({
        //         dragging: dndContext.active ? "active" : "default"
        //     })}
        //     type="auto"
        // >
        //     {/* calculate the same height as the parent TabsContent - because scroll areas don't like h-full >:( */}
        //     <div className="h-[calc(100vh-10rem)] flex gap-4 items-start flex-row justify-start">
        //         {children}
        //     </div>
        //     <ScrollBar orientation="horizontal" />
        // </ScrollArea>

        <div className="h-[calc(100vh-10rem)] flex gap-4 items-start flex-row justify-start">
            {children}
        </div>
    )
}
