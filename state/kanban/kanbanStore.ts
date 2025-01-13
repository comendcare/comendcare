import {create} from "zustand"
import {temporal} from 'zundo'
import {Column, Task} from "@prisma/client";
import { createKanbanColumn, createNewKanbanTask, deleteKanbanColumn, updateDBColumns, updateDBTask } from "@/lib/actions";
import { nanoid } from "nanoid";
import { toast } from "sonner";

export type KanbanState = {
    columns: any[],
    tasks: any[],
    initState: (columns: Column[], tasks: any[]) => void,
    addColumn: (column: any) => void,
    deleteColumn: (columnId: string) => void,
    setColumn: (columnId: string, newProperties: any) => void,
    setColumns: (columns: Column[]) => void,
    addTask: (columnId: string) => void,
    setTask: (taskId: string, newProperties: any) => void,
    setTasks: (tasks: any[]) => void
}

export const useKanbanStore = create<KanbanState>()(
    temporal((set, get) => ({
            columns: [],
            tasks: [],
            initState: (columns: Column[], tasks: any[]) => {
                set({ columns, tasks })
            },
            addColumn: (column: Column) => {
                column = {
                    ...column,
                    id: nanoid()
                }

                set({ columns: [...get().columns, column] })
                createKanbanColumn(column).then((response) => {
                    if (response.success && response.data) {
                        toast.success("Column created successfully!")
                    } else {
                        console.error(response.error)
                        toast.error(response.error)
                    }
                })
            },
            deleteColumn: (columnId: string) => {
                set({ columns: get().columns.filter(col => col.id !== columnId) })
                deleteKanbanColumn(columnId).then((response) => {
                    if (response.success && response.data) {
                        toast.success("Column deleted successfully!");
                    } else {
                        console.error(response.error)
                        toast.error(response.error)
                    }
                })
            },
            setColumn: (columnId: string, newProperties: any) => {
                const updatedColumns = get().columns.map(column => {
                    if (column.id === columnId) {
                        return ({
                            ...column,
                            ...newProperties
                        })
                    }

                    return column
                })
                set({ columns: updatedColumns })
                updateDBColumns({ columns: updatedColumns })
            },
            setColumns: (columns: Column[]) => {
                set({ columns })
                updateDBColumns({ columns })
            },
            addTask: (columnId: string) => {
                const task = {
                    id: nanoid(),
                    name: "New Task",
                    columnId,
                    orderPosition: 0,
                    kanbanPosition: 0
                }

                set({ tasks: [...get().tasks, task] })
                createNewKanbanTask(task).then((response) => {
                    if (response.success && response.data) {
                        toast.success("Task added successfully!")
                    } else {

                    }
                })
            },
            setTask: (taskId: string, newProperties: any) => {
                const updatedTasks = get().tasks.map(task => {
                    if (task.id === taskId) {
                        return ({
                            ...task,
                            ...newProperties
                        })
                    }

                    return task
                })
                updateDBTask({ tasks: updatedTasks })
                set({ tasks: updatedTasks })
            },
            setTasks: (tasks: any[]) => {
                updateDBTask({ tasks })
                set({ tasks: tasks })
            },
        }),
        {
            limit: 100, // limit the stored history states to 100
            onSave: (pastState, currentState) => {
                console.log(`Saved Kanban State: `, currentState)
                return
            },
        })
)
