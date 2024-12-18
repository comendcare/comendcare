import {create} from "zustand"
import {temporal} from 'zundo'
import {Column, Task} from "@prisma/client";
import { createKanbanColumn, createNewKanbanTask, updateDBTask } from "@/lib/actions";
import { nanoid } from "nanoid";

export type KanbanState = {
    columns: any[],
    tasks: any[],
    initState: (columns: Column[], tasks: any[]) => void
    addColumn: (column: any) => void,
    addTask: (columnId: string) => void,
    setTask: (taskId: string, newProperties: any) => void
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
                // const milestones = get().milestones.map(milestone => {
                //     if (milestone?.tasks?.map((task: any) => task.id).includes(taskId)) {
                //         return {
                //             ...milestone,
                //             tasks: milestone.tasks.map((task: any) => (
                //                 task.id === taskId ? {...task, ...newProperties} : task
                //             ))
                //         }
                //     } else {
                //         return milestone
                //     }
                // })
                // set({ milestones })
                // const task = get().milestones.map(milestone => milestone?.tasks || []).flat(1).filter(task => task.id === taskId)
                // if (task) updateDBTask({ tasks: task })
            },
        }),
        {
            limit: 100, // limit the stored history states to 100
        })
)
