import {create} from "zustand"
import {temporal} from 'zundo'
import {Column} from "@prisma/client";
import { createNewKanbanTask } from "@/lib/actions";

export type KanbanState = {
    columns: any[],
    tasks: any[],
    initState: (columns: Column[], tasks: any[]) => void
    addTask: (task: any) => void
}

export const useKanbanStore = create<KanbanState>()(
    temporal((set, get) => ({
            columns: [],
            tasks: [],
            initState: (columns: Column[], tasks: any[]) => {
                set({columns, tasks})
            },
            addTask: (task: any) => {
                console.log(`ADD TASK`, task)
                set({ tasks: [...get().tasks, task] })
                createNewKanbanTask(task)
            }
        }),
        {
            limit: 100, // limit the stored history states to 100
        })
)
