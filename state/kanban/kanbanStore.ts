import {create} from "zustand"
import {temporal} from 'zundo'
import {Column, Task} from "@prisma/client";
import { createKanbanColumn, createNewKanbanTask, deleteKanbanColumn, updateDBTask } from "@/lib/actions";
import { nanoid } from "nanoid";

export type KanbanState = {
    columns: any[],
    tasks: any[],
    initState: (columns: Column[], tasks: any[]) => void,
    addColumn: (column: any) => void,
    deleteColumn: (columnId: string) => void,
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
                createKanbanColumn(column)
            },
            deleteColumn: (columnId: string) => {
                set({ columns: get().columns.filter(col => col.id !== columnId) })
                deleteKanbanColumn(columnId)
            },
            setColumns: (columns: Column[]) => {
                set({ columns })
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
                createNewKanbanTask(task)
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
                set({ tasks: updatedTasks })
                updateDBTask({ tasks: updatedTasks })
            },
            setTasks: (tasks: any[]) => {
                // const milestones = get().milestones.map(milestone => {
                //     return {
                //         ...milestone,
                //         tasks: tasks.filter(task => task.milestoneId === milestone.id)
                //     }
                // })
                // set({ milestones })
                set({ tasks })
                updateDBTask({ tasks })
            },
        }),
        {
            limit: 100, // limit the stored history states to 100
        })
)
