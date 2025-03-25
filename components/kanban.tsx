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
    closestCorners,
    CollisionDetection,
    pointerWithin
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "./ui/button"
import { FaRedo, FaUndo } from "react-icons/fa"

export type ColumnId = string

const kanbanSelector = (state: KanbanState) => ({
    columns: state.columns,
    tasks: state.tasks,
    setTasks: state.setTasks,
    setColumns: state.setColumns,
    saveState: state.saveState
})

export function KanbanView() {
    const { undo, redo } = useKanbanStore.temporal.getState()
    const {columns, tasks, saveState} = useKanbanStore(useShallow(kanbanSelector))
    const [sortBy, setSortBy] = useState<string>('default')
    const [mountKey, setMountKey] = useState(1);
    const mountKeyRef = useRef(mountKey);
    
    // useEffect(() => {
    //     mountKeyRef.current = mountKey;  // Always sync ref with the latest state
    
    //     const handleUndoRedo = (event: KeyboardEvent) => {
    //         console.log(event)
    //         if (event.shiftKey && (event.metaKey || event.ctrlKey) && event.key === "z") {
    //             console.log("Redo action triggered")
    //             redo() // undo updates zustand state
    //             saveState() // save state to update database

    //             setMountKey(prevKey => prevKey + 1)

    //             return
    //         }
    //         if ((event.metaKey || event.ctrlKey) && event.key === "z") {
    //             console.log("Undo action triggered");
    //             undo(); // undo updates zustand state
    //             saveState(); // save state to update database
    
    //             setMountKey(prevKey => prevKey + 1)
    //         }
    //     };
    
    //     document.addEventListener("keydown", handleUndoRedo);
    //     return () => document.removeEventListener("keydown", handleUndoRedo);
    // }, [mountKey]);

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
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={() => {
                            console.log("Undo action triggered")
                            undo() // undo updates zustand state
                            saveState() // save state to update database
                            setMountKey(prev => prev + 1)
                        }} size={"icon"} variant={"ghost"}>
                            <FaUndo />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-80">
                        <p>{`Undo`}</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={() => {
                            console.log("Redo action triggered")
                            redo() // undo updates zustand state
                            saveState() // save state to update database
                            setMountKey(prev => prev + 1)
                        }} size={"icon"} variant={"ghost"}>
                            <FaRedo />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-80">
                        <p>{`Redo`}</p>
                    </TooltipContent>
                </Tooltip>
                <NewColumnDialog />
            </div>
            <ScrollArea className="pr-4 pb-4">
                <div>
                    <TabsContent value="team" className="mt-0">
                        <Kanban
                            mountKey={mountKey}
                            initColumns={columns}
                            initTasks={tasks}
                            filter={"team"}
                            sortBy={sortBy}
                        />
                    </TabsContent>
                    <TabsContent value="personal" className="mt-0">
                        <Kanban
                            mountKey={mountKey}
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

function Kanban({initColumns, initTasks, filter, sortBy, mountKey}: {
    initColumns: Column[],
    initTasks: Task[],
    filter: 'team' | 'personal' | undefined,
    sortBy?: string | undefined,
    mountKey: number
}) {
    const {data: session} = useSession()
    const {
        tasks: stateTasks,
        columns: stateColumns,
        setTasks: setDbTasks,
        setColumns: setDbColumns
    } = useKanbanStore(useShallow(kanbanSelector))
    const pickedUpTaskColumn = useRef<ColumnId | null>(null)

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

    const sortKanbanColumns = (columnList: Column[]) => {
        // columns are always sorted by default order (manually set by user)
        columnList = columnList?.sort((a: Column, b: Column) => {
            if (a.kanbanPosition !== undefined && b.kanbanPosition !== undefined && a.kanbanPosition !== b.kanbanPosition) {
                return a.kanbanPosition - b.kanbanPosition
            }
            return 0
        })

        return columnList
    }

    // kanban requires its own state outside of the zustand state, so we can move things around properly
    const [tasks, setTasks] = useState<Task[]>(sortKanbanTasks(initTasks))
    const [columns, setColumns] = useState<Column[]>(sortKanbanColumns(initColumns))

    const columnIds = useMemo(() => { return columns.map(col => col.id) }, [columns])

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
                const startColumnIdx = columnIds.findIndex(
                    id => id === active.id
                )
                const startColumn = columns[startColumnIdx]
                return `Picked up Column ${startColumn?.name} at position: ${
                    startColumnIdx + 1
                } of ${columnIds.length}`
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
                const overColumnIdx = columnIds.findIndex(id => id === over.id)
                return `Column ${active.data.current.column.name} was moved over ${
                    over.data.current.column.name
                } at position ${overColumnIdx + 1} of ${columnIds.length}`
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
                const overColumnPosition = columnIds.findIndex(
                    id => id === over.id
                )

                return `Column ${
                    active.data.current.column.name
                } was dropped into position ${overColumnPosition + 1} of ${
                    columnIds.length
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

        if (event?.active?.data?.current?.type === "Column") {
            setDbColumns(columns.map((col, index) => (
                {...col, kanbanPosition: index}
            )))
            return
        }

        if (event?.active?.data?.current?.type === "Task") {
            setDbTasks(tasks.map((task, index) => (
                {...task, kanbanPosition: index}
            )))
            return
        }
    }

    function onDragOver(event: DragOverEvent) {
        console.log(`drag over`, event)
        const {active, over} = event
        if (!over) return

        const activeId = active.id
        let overId = over.id

        if (activeId === overId) return

        if (!hasDraggableData(active) || !hasDraggableData(over)) return

        const activeData = active.data.current
        const overData = over.data.current

        const isActiveATask = activeData?.type === "Task"
        const isActiveAColumn = activeData?.type === "Column"
        const isOverATask = overData?.type === "Task"
        const isOverAColumn = overData?.type === "Column"

        if (isActiveATask) {
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
        } else if (isActiveAColumn) {
            // Im dropping a Column over another Column
            if (isActiveAColumn && isOverAColumn) {
                setColumns(columns => {
                    const activeIndex = columns.findIndex((c: any) => c.id === activeId)
                    const overIndex = columns.findIndex((c: any) => c.id === overId)

                    return arrayMove(columns, activeIndex, overIndex)
                })

                const activeIndex = columns.findIndex((c: any) => c.id === activeId)
                const overIndex = columns.findIndex((c: any) => c.id === overId)

                return arrayMove(columns, activeIndex, overIndex)
            }
        }
    }

    // Custom collision detection that ignores tasks when dragging a column
    const customCollisionDetection: CollisionDetection = (args) => {
        const { active } = args

        // Get the active item's type
        const activeData = active?.data?.current
        const isActiveAColumn = activeData?.type === "Column"

        // Run a default detection method (e.g., pointerWithin)
        let collisions = pointerWithin(args)

        // If dragging a column, ignore tasks
        if (isActiveAColumn) {
            collisions = collisions.filter(({ id }) => {
                const overElement = document.getElementById(String(id))
                return overElement?.dataset.type !== "Task" // Only allow columns as drop targets
            })
        }

        return collisions
    }

    return (
        <DndContext
            accessibility={{ announcements }}
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            collisionDetection={customCollisionDetection} // Use custom collision detection
        >
            <BoardContainer>
                <SortableContext items={columnIds}>
                    {columns.length > 0 ? columns?.map((col, index) => (
                        <BoardColumn
                            mountKey={mountKey}
                            key={col.id}
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
                                mountKey={mountKey}
                                isOverlay
                                column={activeColumn}
                                tasks={tasks?.filter(task => task?.columnId === activeColumn.id)}
                            />
                        )}
                        {activeTask && <TaskCard task={activeTask} isOverlay mountKey={mountKey} />}
                    </DragOverlay>,
                    document.body
                )}
        </DndContext>
    )
}
