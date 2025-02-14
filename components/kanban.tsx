"use client"
import {useEffect, useMemo, useRef, useState} from "react"
import {createPortal} from "react-dom"

import {BoardColumn, BoardContainer} from "@/components/board-column"
import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    useSensor,
    useSensors,
    KeyboardSensor,
    Announcements,
    UniqueIdentifier,
    TouchSensor,
    MouseSensor,
    closestCorners
} from "@dnd-kit/core"
import {SortableContext, arrayMove} from "@dnd-kit/sortable"
import {type Task, TaskCard} from "@/components/task-card"
import {hasDraggableData} from "@/lib/utils"
import {coordinateGetter} from "@/lib/multiple-containers-keyboard-preset"
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore"
import {useShallow} from "zustand/react/shallow"
import {KanbanState, useKanbanStore} from "@/state/kanban/kanbanStore";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useSession} from "next-auth/react"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select"
import {Column} from "@/lib/actions"
import NewColumnDialog from "./new-column-dialog"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"

export type ColumnId = string

const kanbanSelector = (state: KanbanState) => ({
    columns: state.columns,
    tasks: state.tasks,
    setTasks: state.setTasks,
    setColumns: state.setColumns
})

export function KanbanView() {
    const {columns, tasks} = useKanbanStore(useShallow(kanbanSelector))
    const [sortBy, setSortBy] = useState<string>('default')

    return (
        <Tabs defaultValue="team" className="w-full p-4 flex flex-col gap-4">
            <div className="flex flex-row gap-4 items-center justify-start">
                <TabsList className="grid w-[400px] grid-cols-2">
                    <TabsTrigger value="team">Team Tasks</TabsTrigger>
                    <TabsTrigger value="personal">My Tasks</TabsTrigger>
                </TabsList>
                <div className="flex flex-row gap-4 items-center">
                    <p>Sort by:</p>
                    <Select value={sortBy} onValueChange={(value: string) => setSortBy(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue defaultValue={'default'} placeholder={"Sort by"}/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">{`Default`}</SelectItem>
                            <SelectItem value="priority">{`Priority (High - Low)`}</SelectItem>
                            <SelectItem value="date">{`Date (Earliest - Latest)`}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <NewColumnDialog />
            </div>
            <ScrollArea type="always" className="pr-4 pb-4">
                <div>
                    <TabsContent value="team" className="mt-0">
                        <Kanban
                            initColumns={columns}
                            initTasks={tasks}
                            filter={"team"}
                            sortBy={sortBy}
                        />
                    </TabsContent>
                    <TabsContent value="personal" className="mt-0">
                        <Kanban
                            initColumns={columns}
                            initTasks={tasks}
                            filter={"personal"}
                            sortBy={sortBy}
                        />
                    </TabsContent>
                </div>
                <ScrollBar orientation="horizontal"/>
                <ScrollBar orientation="vertical"/>
            </ScrollArea>
        </Tabs>
    )
}

function Kanban({initColumns, initTasks, filter, sortBy}: {
    initColumns: Column[],
    initTasks: Task[],
    filter: 'team' | 'personal' | undefined,
    sortBy?: string | undefined
}) {
    const {data: session} = useSession()
    const {
        tasks: stateTasks,
        columns: stateColumns,
        setTasks: setDbTasks,
        setColumns: setDbColumns
    } = useKanbanStore(useShallow(kanbanSelector))
    const [columns, setColumns] = useState<Column[]>([])
    const pickedUpTaskColumn = useRef<ColumnId | null>(null)
    const columnsId = useMemo(() => columns?.map(col => col.id), [columns])

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: coordinateGetter
        })
    )

    const sortKanbanTasks = (taskList: Task[]) => {
        const priorities = ['HIGH', 'MEDIUM', 'LOW']

        // sort default (kanban & order position)
        // always reset to default before re-sorting, to ensure sorting result is always the same
        taskList = taskList?.sort((a: Task, b: Task) => {
            if (a.kanbanPosition !== undefined && b.kanbanPosition !== undefined && a.kanbanPosition !== b.kanbanPosition) {
                return a.kanbanPosition - b.kanbanPosition
            }
            return a.orderPosition - b.orderPosition
        })

        if (sortBy === 'priority') {
            // sort by task priority (if it has one), move those without priority to the end
            taskList = taskList?.sort((a: Task, b: Task) => {
                if ((!a.priority || !priorities.includes(a.priority)) && (!b.priority || !priorities.includes(b.priority))) return 0
                if (!a.priority || !priorities.includes(a.priority)) return 1
                if (!b.priority || !priorities.includes(b.priority)) return -1

                // Both tasks have priority, sort by priority
                return priorities.indexOf(a.priority) - priorities.indexOf(b.priority)
            })
        } else if (sortBy === 'date') {
            // sort by task target date (if it has one), move those without an end date to the end
            taskList = taskList?.sort((a: Task, b: Task) => {
                if (!a.endDate && !b.endDate) return 0
                if (!a.endDate) return 1
                if (!b.endDate) return -1

                // Both tasks have end dates, sort by the end date
                return a.endDate.getTime() - b.endDate.getTime()
            })
        }

        return taskList
    }

    // kanban requires its own state outside of the zustand state, so we can move things around properly
    const [tasks, setTasks] = useState<Task[]>(sortKanbanTasks(initTasks))

    const [activeColumn, setActiveColumn] = useState<Column | null>(null)

    const [activeTask, setActiveTask] = useState<Task | null>(null)

    useEffect(() => {
        // ensure we're updating the kanban tasks state whenever the zustand tasks state changes
        // React doesn't automatically re-render the component when initTasks changes
        setColumns(initColumns)
        setTasks(sortKanbanTasks(initTasks))
    }, [initTasks, initColumns, filter, sortBy])

    function getDraggingTaskData(taskId: UniqueIdentifier, columnId: ColumnId) {
        const tasksInColumn = tasks?.filter(task => task.columnId === columnId)
        const taskPosition = tasksInColumn.findIndex(task => task.id === taskId)
        const column = columns.find(col => col.id === columnId)
        return {
            tasksInColumn,
            taskPosition,
            column
        }
    }

    const announcements: Announcements = {
        onDragStart({active}) {
            if (!hasDraggableData(active)) return
            if (active.data.current?.type === "Column") {
                const startColumnIdx = columnsId.findIndex(
                    id => id === active.id
                )
                const startColumn = columns[startColumnIdx]
                return `Picked up Column ${startColumn?.name} at position: ${
                    startColumnIdx + 1
                } of ${columnsId.length}`
            } else if (active.data.current?.type === "Task") {
                pickedUpTaskColumn.current = active.data.current.task.columnId
                const {tasksInColumn, taskPosition, column} =
                    getDraggingTaskData(active.id, pickedUpTaskColumn.current)
                return `Picked up Task ${
                    active.data.current.task.name
                } at position: ${taskPosition + 1} of ${
                    tasksInColumn.length
                } in column ${column?.name}`
            }
        },
        onDragOver({active, over}) {
            if (!hasDraggableData(active) || !hasDraggableData(over)) return

            if (
                active.data.current?.type === "Column" &&
                over.data.current?.type === "Column"
            ) {
                const overColumnIdx = columnsId.findIndex(id => id === over.id)
                return `Column ${active.data.current.column.name} was moved over ${
                    over.data.current.column.name
                } at position ${overColumnIdx + 1} of ${columnsId.length}`
            } else if (
                active.data.current?.type === "Task" &&
                over.data.current?.type === "Task"
            ) {
                const {tasksInColumn, taskPosition, column} =
                    getDraggingTaskData(
                        over.id,
                        over.data.current.task.columnId
                    )
                if (
                    over.data.current.task.columnId !==
                    pickedUpTaskColumn.current
                ) {
                    return `Task ${
                        active.data.current.task.name
                    } was moved over column ${column?.name} in position ${
                        taskPosition + 1
                    } of ${tasksInColumn.length}`
                }
                return `Task was moved over position ${taskPosition + 1} of ${
                    tasksInColumn.length
                } in column ${column?.name}`
            }
        },
        onDragEnd({active, over}) {
            if (!hasDraggableData(active) || !hasDraggableData(over)) {
                pickedUpTaskColumn.current = null
                return
            }
            if (
                active.data.current?.type === "Column" &&
                over.data.current?.type === "Column"
            ) {
                const overColumnPosition = columnsId.findIndex(
                    id => id === over.id
                )

                return `Column ${
                    active.data.current.column.name
                } was dropped into position ${overColumnPosition + 1} of ${
                    columnsId.length
                }`
            } else if (
                active.data.current?.type === "Task" &&
                over.data.current?.type === "Task"
            ) {
                const {tasksInColumn, taskPosition, column} =
                    getDraggingTaskData(
                        over.id,
                        over.data.current.task.columnId
                    )
                if (
                    over.data.current.task.columnId !==
                    pickedUpTaskColumn.current
                ) {
                    return `Task was dropped into column ${column?.name} in position ${
                        taskPosition + 1
                    } of ${tasksInColumn.length}`
                }
                return `Task was dropped into position ${taskPosition + 1} of ${
                    tasksInColumn.length
                } in column ${column?.name}`
            }
            pickedUpTaskColumn.current = null
        },
        onDragCancel({active}) {
            pickedUpTaskColumn.current = null
            if (!hasDraggableData(active)) return
            return `Dragging ${active.data.current?.type} cancelled.`
        }
    }

    const isBrowser = typeof window !== "undefined"

    function onDragStart(event: DragStartEvent) {
        if (!hasDraggableData(event.active)) return
        const data = event.active.data.current
        if (data?.type === "Column") {
            setActiveColumn(data.column)
            return
        }

        if (data?.type === "Task") {
            setActiveTask(data.task)
            return
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null)
        setActiveTask(null)

        setDbTasks(tasks.map((task, index) => (
            {...task, kanbanPosition: index}
        )))

        const {active, over} = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (!hasDraggableData(active)) return

        const activeData = active.data.current

        if (activeId === overId) return

        const isActiveAColumn = activeData?.type === "Column"
        if (!isActiveAColumn) return

        const activeColumnIndex = columns.findIndex(
            col => col.id === activeId
        )

        const overColumnIndex = columns.findIndex(col => col.id === overId)

        setDbColumns(
            arrayMove(columns, activeColumnIndex, overColumnIndex)
                .map((col, index) => ({...col, kanbanPosition: index}))
        )
    }

    function onDragOver(event: DragOverEvent) {
        const {active, over} = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        if (!hasDraggableData(active) || !hasDraggableData(over)) return

        const activeData = active.data.current
        const overData = over.data.current

        const isActiveATask = activeData?.type === "Task"
        const isOverATask = overData?.type === "Task"

        if (!isActiveATask) return

        // Im dropping a Task over another Task
        if (isActiveATask && isOverATask) {
            setTasks(tasks => {
                const activeIndex = tasks.findIndex((t: any) => t.id === activeId)
                const overIndex = tasks.findIndex((t: any) => t.id === overId)
                const activeTask = tasks[activeIndex]
                const overTask = tasks[overIndex]
                if (
                    activeTask &&
                    overTask &&
                    activeTask.columnId !== overTask.columnId
                ) {
                    activeTask.columnId = overTask.columnId
                    return arrayMove(tasks, activeIndex, overIndex - 1)
                }

                return arrayMove(tasks, activeIndex, overIndex)
            })

            const activeIndex = tasks.findIndex((t: any) => t.id === activeId)
            const overIndex = tasks.findIndex((t: any) => t.id === overId)
            const activeTask = tasks[activeIndex]
            const overTask = tasks[overIndex]
            if (
                activeTask &&
                overTask &&
                activeTask.columnId !== overTask.columnId
            ) {
                activeTask.columnId = overTask.columnId
                return arrayMove(tasks, activeIndex, overIndex - 1)
            }

            return arrayMove(tasks, activeIndex, overIndex)
        }

        const isOverAColumn = overData?.type === "Column"

        // Im dropping a Task over a column
        if (isActiveATask && isOverAColumn) {
            setTasks(tasks => {
                const activeIndex = tasks.findIndex(t => t.id === activeId)
                const activeTask = tasks[activeIndex]
                if (activeTask) {
                    activeTask.columnId = overId as ColumnId
                    return arrayMove(tasks, activeIndex, activeIndex)
                }
                return tasks
            })

            const activeIndex = tasks.findIndex(t => t.id === activeId)
            const activeTask = tasks[activeIndex]
            if (activeTask) {
                activeTask.columnId = overId as ColumnId
                return arrayMove(tasks, activeIndex, activeIndex)
            }
            return tasks
        }
    }

    return (
        <DndContext
            accessibility={{
                announcements
            }}
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
        >
            <BoardContainer>
                <SortableContext items={columnsId}>
                    {columns.length > 0 ? columns?.map((col, index) => (
                        <BoardColumn
                            key={index}
                            column={col}
                            tasks={tasks?.filter(task => {
                                if (filter == "personal" && session?.user.id && !task.stakeholders?.map(stakeholder => stakeholder.userId).includes(session?.user.id)) return false
                                return task?.columnId === col.id
                            })}
                            filter={filter}
                        />
                    )) : <div>{`You don't have any columns`}</div>}
                </SortableContext>
            </BoardContainer>

            {isBrowser &&
                createPortal(
                    <DragOverlay>
                        {activeColumn && (
                            <BoardColumn
                                isOverlay
                                column={activeColumn}
                                tasks={tasks?.filter(task => task?.columnId === activeColumn.id)}
                            />
                        )}
                        {activeTask && <TaskCard task={activeTask} isOverlay/>}
                    </DragOverlay>,
                    document.body
                )}
        </DndContext>
    )
}
