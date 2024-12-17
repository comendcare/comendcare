import {create} from "zustand"
import {temporal} from 'zundo'
import {Column} from "@prisma/client";

export type KanbanState = {
    columns: any[]
    initState: (columns: Column[]) => void
}

export const useKanbanStore = create<KanbanState>()(
    temporal((set, get) => ({
            columns: [],
            initState: (columns: Column[]) => {
                set({columns})
            },
        }),
        {
            limit: 100, // limit the stored history states to 100
            // this handleSet should be where we're setting our debounce, but for some reason it grabs the previous state
            // not the current state
            // handleSet: (handleSet) => (
            //     debounce((state) => {
            //         console.log(`Saved State:`, state)
            //         handleSet(state)
            //         saveToDatabase(state.nodes, state.edges, state.milestones)
            //     }, 500)
            // ),
            onSave: (pastState, currentState) => {
                console.log(`Saved State: `, currentState)
                // debouncedSaveToDatabase(currentState.nodes, currentState.edges, currentState.milestones)
                return
            },
        })
)
