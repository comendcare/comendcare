import {create} from "zustand"
import {temporal} from 'zundo'
import { Column, createColumn, createTask, deleteColumn, deleteTask, Task, updateColumns, updateTasks } from "@/lib/actions";
import { nanoid } from "nanoid";
import { toast } from "sonner";

export type KanbanState = {
    columns: any[],
    tasks: any[],
    initState: (columns: Column[], tasks: any[]) => void,
    addColumn: (column: any) => Promise<Column | void>,
    deleteColumn: (columnId: string) => Promise<Column | void>
    updateColumn: (columnId: string, newProperties: any) => Promise<Column[] | void>,
    setColumns: (columns: Column[]) => Promise<Column[] | void>,
    addTask: (columnId: string) => Promise<Task | void>,
    updateTask: (taskId: string, newProperties: any) => Promise<Task[] | void>,
    setTasks: (tasks: any[]) => Promise<Task[] | void>,
    deleteTask: (taskId: string) => Promise<Task | void>,
}

export const useKanbanStore = create<KanbanState>()(
    temporal((set, get) => ({
            columns: [],
            tasks: [],
            initState: (columns: Column[], tasks: any[]) => {
                set({ columns, tasks })
            },
            addColumn: async (column: Partial<Column>) => {
                // create column in the database
                const response = await createColumn(column)
                if (response.success && response.data) {
                    // if column was created successfully, update zustand state
                    set({ columns: [...get().columns, response.data as Column] })

                    toast.success("Column added successfully!")
                    return response.data as Column
                } else {
                    console.error("Error adding column", response.error)
                }
            },
            deleteColumn: async (columnId: string) => {
                const response = await deleteColumn(columnId)
                if (response.success && response.data) {
                    // if task was successfully deleted, update zustand state
                    set({ columns: get().columns.filter(col => col.id !== response.data.id)})

                    toast.success("Column deleted successfully!")
                    return response.data as Column
                } else {
                    console.error("Error deleting column", response.error)
                }
            },
            updateColumn: async (columnId: string, newProperties: any) => {
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
                if (response.success && response.data) {
                    // if task was created successfully, update zustand state
                    set({ columns: response.data as Column[] })

                    toast.success("Column updated successfully!")
                    return response.data as Column[]
                } else {
                    console.error("Error updating column", response.error)
                }
            },
            setColumns: async (columns: Column[]) => {
                const response = await updateColumns({ columns })
                if (response.success && response.data) {
                    // if task was created successfully, update zustand state
                    set({ columns: response.data as Column[] })

                    toast.success("Column updated successfully!")
                    return response.data as Column[]
                } else {
                    console.error("Error updating column", response.error)
                }
            },
            addTask: async (columnId: string) => {
                // create task in the database
                const response = await createTask(columnId)

                if (response.success && response.data) {
                    // if task was created successfully, update zustand state
                    set({ tasks: [...get().tasks, response.data] })

                    toast.success("Task added successfully!")
                    return response.data as Task
                } else {
                    console.error("Error adding task", response.error)
                }
            },
            updateTask: async (taskId: string, newProperties: Partial<Task>) => {
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
                if (response.success && response.data) {
                    // if task was created successfully, update zustand state
                    set({ tasks: response.data as Task[] })

                    toast.success("Task updated successfully!")
                    return response.data as Task[]
                } else {
                    console.error("Error adding task", response.error)
                }
            },
            setTasks: async (tasks: Task[]) => {
                const response = await updateTasks({ tasks })
                if (response.success && response.data) {
                    // if task was created successfully, update zustand state
                    set({ tasks: response.data as Task[] })

                    toast.success("Tasks updated successfully!")
                    return response.data as Task[]
                } else {
                    console.error("Error adding task", response.error)
                }
            },
            deleteTask: async (taskId: string) => {
                const response = await deleteTask(taskId)
                if (response.success && response.data) {
                    // if task was successfully deleted, update zustand state
                    set({ tasks: get().tasks.filter(task => task.id !== response.data.id)})

                    toast.success("Task deleted successfully!")
                    return response.data as Task
                } else {
                    console.error("Error deleting task", response.error)
                }
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
