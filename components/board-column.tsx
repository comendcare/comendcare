import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { useDndContext, type UniqueIdentifier } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useMemo } from "react"
import { Task, TaskCard } from "@/components/task-card"
import { cva } from "class-variance-authority"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "./ui/button"
import { GripVertical } from "lucide-react"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { cn } from "@/lib/utils"

export interface Column {
    id: UniqueIdentifier
    title: string
    styling: string
}

export type ColumnType = "Column"

export interface ColumnDragData {
    type: ColumnType
    column: Column
}

interface BoardColumnProps {
    column: Column
    tasks: Task[]
    isOverlay?: boolean
}

export function BoardColumn({ column, tasks, isOverlay }: BoardColumnProps) {
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
            roleDescription: `Column: ${column.title}`
        }
    })

    const style = {
        transition,
        transform: CSS.Translate.toString(transform)
    }

    const variants = cva(
        "h-full max-h-[800px] w-[350px] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center",
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

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={variants({
                dragging: isOverlay
                    ? "overlay"
                    : isDragging
                      ? "over"
                      : undefined
            })}
        >
            <CardHeader className={cn(
                "p-4 font-semibold border-b-2 text-left flex flex-row space-between items-center",
                column.styling
            )}>
                <CardTitle>{column.title}</CardTitle>
            </CardHeader>
            <ScrollArea className="h-full">
                <CardContent className="flex flex-grow flex-col gap-2 p-2">
                    <SortableContext items={tasksIds}>
                        {tasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </SortableContext>
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
        <ScrollArea
            className={variations({
                dragging: dndContext.active ? "active" : "default"
            })}
            type="auto"
        >
            {/* calculate the same height as the parent TabsContent - because scroll areas don't like h-full >:( */}
            <div className="h-[calc(100vh-3.5rem)] p-4 flex gap-4 items-center flex-row justify-center">
                {children}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}
