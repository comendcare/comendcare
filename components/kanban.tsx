"use client"
import {useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";

import {BoardColumn, BoardContainer} from "@/components/board-column";
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
} from "@dnd-kit/core";
import {SortableContext, arrayMove} from "@dnd-kit/sortable";
import {type Task, TaskCard} from "@/components/task-card";
import type {Column} from "@/components/board-column";
import {hasDraggableData} from "@/lib/utils";
import {coordinateGetter} from "@/lib/multiple-containers-keyboard-preset";

const defaultCols = [
    {
        id: "todo" as const,
        title: "Todo",
    },
    {
        id: "in-progress" as const,
        title: "In progress",
    },
    {
        id: "done" as const,
        title: "Done",
    },
] satisfies Column[];

export type ColumnId = (typeof defaultCols)[number]["id"];
const initialTasks: Task[] = [
    {
        id: "task1",
        columnId: "done",
        content: "Identify mutated gene responsible for the rare disease",
    },
    {
        id: "task2",
        columnId: "done",
        content: "Conduct initial literature review on disease and mutations",
    },
    {
        id: "task3",
        columnId: "done",
        content: "Determine disease progression and key biomarkers",
    },
    {
        id: "task4",
        columnId: "in-progress",
        content: "Develop in vitro assays for testing gene functionality",
    },
    {
        id: "task5",
        columnId: "in-progress",
        content: "Create and validate mouse model for preclinical studies",
    },
    {
        id: "task6",
        columnId: "todo",
        content: "Perform high-throughput screening of compounds",
    },
    {
        id: "task7",
        columnId: "todo",
        content: "Evaluate therapeutic efficacy in preclinical models",
    },
    {
        id: "task8",
        columnId: "todo",
        content: "Select potential lead compounds for further testing",
    },
    {
        id: "task9",
        columnId: "todo",
        content: "Develop gene therapy vector targeting identified gene",
    },
    {
        id: "task10",
        columnId: "todo",
        content: "Conduct toxicology studies for lead compound",
    },
    {
        id: "task11",
        columnId: "todo",
        content: "Prepare regulatory documentation for clinical trial approval",
    },
    {
        id: "task12",
        columnId: "todo",
        content: "Initiate Phase I clinical trial with selected patients",
    },
    {
        id: "task13",
        columnId: "todo",
        content: "Monitor adverse effects and safety data during trials",
    },
    {
        id: "task14",
        columnId: "todo",
        content: "Identify suitable patient population for Phase II trial",
    },
    {
        id: "task15",
        columnId: "todo",
        content: "Prepare submission for Orphan Drug Designation",
    },
    {
        id: "task16",
        columnId: "todo",
        content: "Evaluate long-term efficacy and safety in Phase III trials",
    },
    {
        id: "task17",
        columnId: "todo",
        content: "Develop patient engagement strategy for trial recruitment",
    },
    {
        id: "task18",
        columnId: "todo",
        content: "Assess gene therapy delivery method for specific tissues",
    },
    {
        id: "task19",
        columnId: "todo",
        content: "Submit data for regulatory review and approval",
    },
    {
        id: "task20",
        columnId: "todo",
        content: "Prepare manufacturing plan for large-scale therapy production",
    }
];

export default function Kanban() {
    const [columns, setColumns] = useState<Column[]>(defaultCols);
    const pickedUpTaskColumn = useRef<ColumnId | null>(null);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);

    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: coordinateGetter,
        })
    );

    function getDraggingTaskData(taskId: UniqueIdentifier, columnId: ColumnId) {
        const tasksInColumn = tasks.filter((task) => task.columnId === columnId);
        const taskPosition = tasksInColumn.findIndex((task) => task.id === taskId);
        const column = columns.find((col) => col.id === columnId);
        return {
            tasksInColumn,
            taskPosition,
            column,
        };
    }

    const announcements: Announcements = {
        onDragStart({active}) {
            if (!hasDraggableData(active)) return;
            if (active.data.current?.type === "Column") {
                const startColumnIdx = columnsId.findIndex((id) => id === active.id);
                const startColumn = columns[startColumnIdx];
                return `Picked up Column ${startColumn?.title} at position: ${
                    startColumnIdx + 1
                } of ${columnsId.length}`;
            } else if (active.data.current?.type === "Task") {
                pickedUpTaskColumn.current = active.data.current.task.columnId;
                const {tasksInColumn, taskPosition, column} = getDraggingTaskData(
                    active.id,
                    pickedUpTaskColumn.current
                );
                return `Picked up Task ${
                    active.data.current.task.content
                } at position: ${taskPosition + 1} of ${
                    tasksInColumn.length
                } in column ${column?.title}`;
            }
        },
        onDragOver({active, over}) {
            if (!hasDraggableData(active) || !hasDraggableData(over)) return;

            if (
                active.data.current?.type === "Column" &&
                over.data.current?.type === "Column"
            ) {
                const overColumnIdx = columnsId.findIndex((id) => id === over.id);
                return `Column ${active.data.current.column.title} was moved over ${
                    over.data.current.column.title
                } at position ${overColumnIdx + 1} of ${columnsId.length}`;
            } else if (
                active.data.current?.type === "Task" &&
                over.data.current?.type === "Task"
            ) {
                const {tasksInColumn, taskPosition, column} = getDraggingTaskData(
                    over.id,
                    over.data.current.task.columnId
                );
                if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
                    return `Task ${
                        active.data.current.task.content
                    } was moved over column ${column?.title} in position ${
                        taskPosition + 1
                    } of ${tasksInColumn.length}`;
                }
                return `Task was moved over position ${taskPosition + 1} of ${
                    tasksInColumn.length
                } in column ${column?.title}`;
            }
        },
        onDragEnd({active, over}) {
            if (!hasDraggableData(active) || !hasDraggableData(over)) {
                pickedUpTaskColumn.current = null;
                return;
            }
            if (
                active.data.current?.type === "Column" &&
                over.data.current?.type === "Column"
            ) {
                const overColumnPosition = columnsId.findIndex((id) => id === over.id);

                return `Column ${
                    active.data.current.column.title
                } was dropped into position ${overColumnPosition + 1} of ${
                    columnsId.length
                }`;
            } else if (
                active.data.current?.type === "Task" &&
                over.data.current?.type === "Task"
            ) {
                const {tasksInColumn, taskPosition, column} = getDraggingTaskData(
                    over.id,
                    over.data.current.task.columnId
                );
                if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
                    return `Task was dropped into column ${column?.title} in position ${
                        taskPosition + 1
                    } of ${tasksInColumn.length}`;
                }
                return `Task was dropped into position ${taskPosition + 1} of ${
                    tasksInColumn.length
                } in column ${column?.title}`;
            }
            pickedUpTaskColumn.current = null;
        },
        onDragCancel({active}) {
            pickedUpTaskColumn.current = null;
            if (!hasDraggableData(active)) return;
            return `Dragging ${active.data.current?.type} cancelled.`;
        },
    };

    const isBrowser = typeof window !== "undefined";

    return (
        <DndContext
            accessibility={{
                announcements,
            }}
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
        >
            <BoardContainer>
                <SortableContext items={columnsId}>
                    {columns.map((col) => (
                        <BoardColumn
                            key={col.id}
                            column={col}
                            tasks={tasks.filter((task) => task.columnId === col.id)}
                        />
                    ))}
                </SortableContext>
            </BoardContainer>

            {isBrowser &&
                createPortal(
                    <DragOverlay>
                        {activeColumn && (
                            <BoardColumn
                                isOverlay
                                column={activeColumn}
                                tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                            />
                        )}
                        {activeTask && <TaskCard task={activeTask} isOverlay/>}
                    </DragOverlay>,
                    document.body
                )}
        </DndContext>
    );

    function onDragStart(event: DragStartEvent) {
        if (!hasDraggableData(event.active)) return;
        const data = event.active.data.current;
        if (data?.type === "Column") {
            setActiveColumn(data.column);
            return;
        }

        if (data?.type === "Task") {
            setActiveTask(data.task);
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);

        const {active, over} = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (!hasDraggableData(active)) return;

        const activeData = active.data.current;

        if (activeId === overId) return;

        const isActiveAColumn = activeData?.type === "Column";
        if (!isActiveAColumn) return;

        setColumns((columns) => {
            const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

            const overColumnIndex = columns.findIndex((col) => col.id === overId);

            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
    }

    function onDragOver(event: DragOverEvent) {
        const {active, over} = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        if (!hasDraggableData(active) || !hasDraggableData(over)) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        const isActiveATask = activeData?.type === "Task";
        const isOverATask = overData?.type === "Task";

        if (!isActiveATask) return;

        // Im dropping a Task over another Task
        if (isActiveATask && isOverATask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);
                const activeTask = tasks[activeIndex];
                const overTask = tasks[overIndex];
                if (
                    activeTask &&
                    overTask &&
                    activeTask.columnId !== overTask.columnId
                ) {
                    activeTask.columnId = overTask.columnId;
                    return arrayMove(tasks, activeIndex, overIndex - 1);
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        const isOverAColumn = overData?.type === "Column";

        // Im dropping a Task over a column
        if (isActiveATask && isOverAColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const activeTask = tasks[activeIndex];
                if (activeTask) {
                    activeTask.columnId = overId as ColumnId;
                    return arrayMove(tasks, activeIndex, activeIndex);
                }
                return tasks;
            });
        }
    }
}