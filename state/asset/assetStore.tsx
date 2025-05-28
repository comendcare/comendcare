import { temporal } from 'zundo';
import { create } from 'zustand';
import { Asset } from '@/lib/types';
import { createOrUpdateAsset, deleteAsset, syncDBAssets } from '@/lib/actions';
import { mixpanelTrack } from '@/app/mixpanel';

export interface AssetState {
    assets: Asset[],
    initialized: boolean,
    initState: (assets: Asset[]) => void,
    createAsset: (asset: Partial<Asset>, orgId: string) => Promise<void>,
    updateAsset: (asset: Partial<Asset>, orgId: string) => Promise<void>,
    deleteAsset: (assetId: string, orgId: string) => Promise<void>,
    saveState: (orgId: string | null | undefined) => void,
}

export const useAssetStore = create<AssetState>()(
    temporal((set, get) => ({
            assets: [],
            initialized: false,
            initState: (assets: Asset[]) => {
                set({assets, initialized: true})
            },
            createAsset: async (asset: Partial<Asset>, orgId: string) => {
                const newAsset = await createOrUpdateAsset(orgId, asset)

                mixpanelTrack("Tool Created", {
                    "ID": newAsset.id,
                    "Name": newAsset.title,
                    "Linked Projects": (newAsset?.milestones || []).map(({ milestone }) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Project Types": (newAsset?.milestones || []).flatMap(({ milestone }) =>
                        (milestone?.types || []).map(type => type.milestoneType.label || type.milestoneType.id)
                    )
                })

                // new Tool first, because Tools are displayed in decending order by creation date
                set({ assets: [newAsset, ...get().assets]})
            },
            updateAsset: async (asset: Partial<Asset>, orgId: string) => {
                const updatedAsset = await createOrUpdateAsset(orgId, asset)
                console.log(`updated asset`, updatedAsset)

                mixpanelTrack("Tool Updated", {
                    "ID": updatedAsset.id,
                    "Tool Name": updatedAsset.title,
                    "Linked Projects": (updatedAsset?.milestones || []).map(({ milestone }) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Project Types": (updatedAsset?.milestones || []).flatMap(({ milestone }) =>
                        (milestone?.types || []).map(type => type.milestoneType.label || type.milestoneType.id)
                    )
                })
                set({ assets: get().assets.map(asset => asset.id === updatedAsset.id ? updatedAsset : asset) })
            },
            deleteAsset: async (assetId: string, orgId: string) => {
                const deletedAsset = await deleteAsset(orgId, assetId)

                mixpanelTrack("Tool Deleted", {
                    "ID": deletedAsset.id,
                    "Tool Name": deletedAsset.title,
                    "Linked Projects": (deletedAsset?.milestones || []).map(({ milestone }) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Project Types": (deletedAsset?.milestones || []).flatMap(({ milestone }) =>
                        (milestone?.types || []).map(type => type.milestoneType.label || type.milestoneType.id)
                    )
                })
                set({ assets: get().assets.filter(asset => asset.id !== deletedAsset.id) })
            },
            saveState: (orgId: string | null | undefined) => {
                console.log(`save state`)
                syncDBAssets(orgId, { assets: get().assets })
            }
        }),
        {
            limit: 1, // limit the stored history states to 1 since we're only using this for the undo button right now
            onSave: (pastState, currentState) => {
                console.log(`Saved assets state: `, currentState)
                return
            },
        })
    )
