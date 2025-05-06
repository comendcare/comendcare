import { temporal } from 'zundo';
import { create } from 'zustand';
import { Tool } from '@/lib/types';
import { createOrUpdateTool, deleteTool, syncDBTools } from '@/lib/actions';
import mixpanel from 'mixpanel-browser';

export interface ToolState {
    tools: Tool[],
    initialized: boolean,
    initState: (tools: Tool[]) => void,
    createTool: (tool: Partial<Tool>, orgId: string) => Promise<void>,
    updateTool: (tool: Partial<Tool>, orgId: string) => Promise<void>,
    deleteTool: (toolId: string) => Promise<void>,
    saveState: () => void,
}

export const useToolStore = create<ToolState>()(
    temporal((set, get) => ({
            tools: [],
            initialized: false,
            initState: (tools: Tool[]) => {
                set({tools, initialized: true})
            },
            createTool: async (tool: Partial<Tool>, orgId: string) => {
                const newTool = await createOrUpdateTool(tool, orgId)
                console.log(`new tool`, newTool)

                mixpanel.track("Tool Created", {
                    "ID": newTool.id,
                    "Name": newTool.title,
                    "Linked Milestones": (newTool?.milestones || []).map(({ milestone }) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Milestone Types": (newTool?.milestones || []).flatMap(({ milestone }) =>
                        (milestone?.types || []).map(type => type.milestoneType.label || type.milestoneType.id)
                    )
                })

                // new Tool first, because Tools are displayed in decending order by creation date
                set({ tools: [newTool, ...get().tools]})
            },
            updateTool: async (tool: Partial<Tool>, orgId: string) => {
                const updatedTool = await createOrUpdateTool(tool, orgId)
                console.log(`updated tool`, updatedTool)

                mixpanel.track("Tool Updated", {
                    "ID": updatedTool.id,
                    "Tool Name": updatedTool.title,
                    "Linked Milestones": (updatedTool?.milestones || []).map(({ milestone }) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Milestone Types": (updatedTool?.milestones || []).flatMap(({ milestone }) =>
                        (milestone?.types || []).map(type => type.milestoneType.label || type.milestoneType.id)
                    )
                })
                set({ tools: get().tools.map(tool => tool.id === updatedTool.id ? updatedTool : tool) })
            },
            deleteTool: async (toolId: string) => {
                const deletedTool = await deleteTool(toolId)
                console.log(`deleted tool`, deletedTool)

                mixpanel.track("Tool Deleted", {
                    "ID": deletedTool.id,
                    "Tool Name": deletedTool.title,
                    "Linked Milestones": (deletedTool?.milestones || []).map(({ milestone }) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Milestone Types": (deletedTool?.milestones || []).flatMap(({ milestone }) =>
                        (milestone?.types || []).map(type => type.milestoneType.label || type.milestoneType.id)
                    )
                })
                set({ tools: get().tools.filter(tool => tool.id !== deletedTool.id) })
            },
            saveState: () => {
                console.log(`save state`)
                syncDBTools({ tools: get().tools })
            }
        }),
        {
            limit: 1, // limit the stored history states to 1 since we're only using this for the undo button right now
            onSave: (pastState, currentState) => {
                console.log(`Saved tools state: `, currentState)
                return
            },
        })
    )
