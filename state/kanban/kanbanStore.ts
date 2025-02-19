import {create} from "zustand"
import {temporal} from 'zundo'
import { Column, createColumn, createTask, deleteColumn, deleteTask, kanbanSync, Task, updateColumns, updateTasks } from "@/lib/actions";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { string } from "zod";

export type KanbanState = {
    kanbanId: string | undefined,
    columns: any[],
    tasks: any[],
    initState: (columns: Column[], tasks: any[], kanbanId: string | undefined) => void,
    addColumn: (column: any) => Promise<Column | void>,
    deleteColumn: (columnId: string) => Promise<Column | void>
    updateColumn: (columnId: string, newProperties: any) => Promise<Column[] | void>,
    setColumns: (columns: Column[]) => Promise<Column[] | void>,
    addTask: (columnId: string, properties?: any) => Promise<Task | void>,
    updateTask: (taskId: string, newProperties: any) => Promise<Task[] | void>,
    setTasks: (tasks: any[]) => Promise<Task[] | void>,
    deleteTask: (taskId: string) => Promise<Task | void>,
    saveState: () => void
}

export const useKanbanStore = create<KanbanState>()(
    temporal((set, get) => ({
            kanbanId: undefined,
            columns: [],
            tasks: [],
            initState: (columns: Column[], tasks: any[], kanbanId: string | undefined) => {
                console.log(`init kanban state`)
                set({ columns, tasks, kanbanId })
            },
            addColumn: async (column: Partial<Column>) => {
                console.log(`add column`)
                // create column in the database
                const response = await createColumn(column)
                if (response?.success && response?.data) {
                    // if column was created successfully, update zustand state
                    set({ columns: [...get().columns, response.data as Column] })

                    // toast.success("Column added successfully!")
                    return response.data as Column
                } else {
                    console.error("Error adding column", response?.error)
                    toast.error('There was an error adding your column')
                }
            },
            deleteColumn: async (columnId: string) => {
                console.log(`delete column`)
                const response = await deleteColumn(columnId)
                if (response?.success && response?.data) {
                    // if task was successfully deleted, update zustand state
                    set({ columns: get().columns.filter(col => col.id !== response.data.id)})

                    // toast.success("Column deleted successfully!")
                    return response.data as Column
                } else {
                    console.error("Error deleting column", response?.error)
                    toast.error('There was an error deleting your column')
                }
            },
            updateColumn: async (columnId: string, newProperties: any) => {
                console.log(`update column`)
                const updatedColumns = get().columns.map(column => {
                    if (column.id === columnId) {
                        return ({
                            ...column,
                            ...newProperties
                        })
                    }

                    return column
                })
                const response = await updateColumns({ columns: updatedColumns })
                if (response?.success && response?.data) {
                    // if task was created successfully, update zustand state
                    set({ columns: response.data as Column[] })

                    // toast.success("Column updated successfully!")
                    return response.data as Column[]
                } else {
                    console.error("Error updating column", response?.error)
                    toast.error('There was an error updating your column')
                }
            },
            setColumns: async (columns: Column[]) => {
                console.log(`set columns`)
                const response = await updateColumns({ columns })
                if (response?.success && response?.data) {
                    // if task was created successfully, update zustand state
                    set({ columns: response.data as Column[] })

                    // toast.success("Column updated successfully!")
                    return response.data as Column[]
                } else {
                    console.error("Error updating column", response?.error)
                    toast.error('There was an error updating your column')
                }
            },
            addTask: async (columnId: string, properties?: any) => {
                console.log(`add task`)
                // create task in the database
                const response = await createTask(columnId, properties)

                if (response?.success && response?.data) {
                    // if task was created successfully, update zustand state
                    set({ tasks: [...get().tasks, response.data] })

                    // toast.success("Task added successfully!")
                    return response.data as Task
                } else {
                    console.error("Error adding task", response?.error)
                    toast.error('There was an error adding your task')
                }
            },
            updateTask: async (taskId: string, newProperties: Partial<Task>) => {
                console.log(`update task`)
                const updatedTasks = get().tasks.map(task => {
                    if (task.id === taskId) {
                        return ({
                            ...task,
                            ...newProperties
                        })
                    }

                    return task
                })

                const response = await updateTasks({ tasks: updatedTasks })
                if (response?.success && response?.data) {
                    // if task was created successfully, update zustand state
                    set({ tasks: response.data as Task[] })

                    // toast.success("Task updated successfully!")
                    return response.data as Task[]
                } else {
                    console.error("Error adding task", response?.error)
                    toast.error('There was an error updating your task')
                }
            },
            setTasks: async (tasks: Task[]) => {
                console.log(`set tasks`)
                const response = await updateTasks({ tasks })
                if (response?.success && response?.data) {
                    // if task was created successfully, update zustand state
                    set({ tasks: response.data as Task[] })

                    // toast.success("Tasks updated successfully!")
                    return response.data as Task[]
                } else {
                    console.error("Error adding task", response?.error)
                    toast.error('There was an error updating your task')
                }
            },
            deleteTask: async (taskId: string) => {
                console.log(`delete task`)
                const response = await deleteTask(taskId)
                if (response?.success && response?.data) {
                    // if task was successfully deleted, update zustand state
                    set({ tasks: get().tasks.filter(task => task.id !== response.data.id)})

                    // toast.success("Task deleted successfully!")
                    return response.data as Task
                } else {
                    console.error("Error deleting task", response?.error)
                    toast.error('There was an error deleting your task')
                }
            },
            saveState: () => {
                console.log(`save state`)
                const state = get()
                // kanbanSync({ kanbanId: state.kanbanId, columns: state.columns, tasks: state.tasks })
            }
        }),
        {
            limit: 100, // limit the stored history states to 100
            onSave: (pastState, currentState) => {
                console.log(`Saved Kanban State: `, currentState)
                return
            },
            // partialize: (state) => {
            //     const { columns, tasks, ...rest } = state;
            //     return { columns, tasks };
            // },
        })
)
