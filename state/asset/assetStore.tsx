import { temporal } from 'zundo';
import { create } from 'zustand';
import { Asset } from '@/lib/types';
import { createOrUpdateAsset, deleteAsset, syncDBAssets } from '@/lib/actions';
import { mixpanelTrack } from '@/app/mixpanel';

export interface AssetState {
    tools: Asset[],
    initialized: boolean,
    initState: (tools: Asset[]) => void,
    createAsset: (tool: Partial<Asset>, orgId: string) => Promise<void>,
    updateAsset: (tool: Partial<Asset>, orgId: string) => Promise<void>,
    deleteAsset: (toolId: string, orgId: string) => Promise<void>,
    saveState: (orgId: string | null | undefined) => void,
}

export const useAssetStore = create<AssetState>()(
    temporal((set, get) => ({
            tools: [],
            initialized: false,
            initState: (tools: Asset[]) => {
                set({tools, initialized: true})
            },
            createAsset: async (tool: Partial<Asset>, orgId: string) => {
                const newAsset = await createOrUpdateAsset(orgId, tool)

                mixpanelTrack("Tool Created", {
                    "ID": newAsset.id,
                    "Name": newAsset.title,
                    "Linked Projects": (newAsset?.milestones || []).map(({ milestone }: {milestone: any}) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Project Types": (newAsset?.milestones || []).flatMap(({ milestone }: {milestone: any}) =>
                        (milestone?.types || []).map((type: any)=> type.milestoneType.label || type.milestoneType.id)
                    )
                })

                // new Tool first, because Tools are displayed in decending order by creation date
                set({ tools: [newAsset, ...get().tools]})
            },
            updateAsset: async (tool: Partial<Asset>, orgId: string) => {
                const updatedAsset = await createOrUpdateAsset(orgId, tool)
                console.log(`updated tool`, updatedAsset)

                mixpanelTrack("Tool Updated", {
                    "ID": updatedAsset.id,
                    "Tool Name": updatedAsset.title,
                    "Linked Projects": (updatedAsset?.milestones || []).map(({ milestone }: {milestone: any}) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Project Types": (updatedAsset?.milestones || []).flatMap(({ milestone }: {milestone: any}) =>
                        (milestone?.types || []).map((type: any) => type.milestoneType.label || type.milestoneType.id)
                    )
                })
                set({ tools: get().tools.map(tool => tool.id === updatedAsset.id ? updatedAsset : tool) })
            },
            deleteAsset: async (toolId: string, orgId: string) => {
                const deletedAsset = await deleteAsset(orgId, toolId)

                mixpanelTrack("Tool Deleted", {
                    "ID": deletedAsset.id,
                    "Tool Name": deletedAsset.title,
                    "Linked Projects": (deletedAsset?.milestones || []).map(({ milestone }: {milestone: any}) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Project Types": (deletedAsset?.milestones || []).flatMap(({ milestone }: {milestone: any}) =>
                        (milestone?.types || []).map((type: any) => type.milestoneType.label || type.milestoneType.id)
                    )
                })
                set({ tools: get().tools.filter(tool => tool.id !== deletedAsset.id) })
            },
            saveState: (orgId: string | null | undefined) => {
                syncDBAssets(orgId, { tools: get().tools })
            }
        }),
        {
            limit: 1, // limit the stored history states to 1 since we're only using this for the undo button right now
            // onSave: (pastState, currentState) => {
            //     console.log(`Saved tools state: `, currentState)
            //     return
            // },
        })
    )
