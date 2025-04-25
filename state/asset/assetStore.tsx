import { temporal } from 'zundo';
import { create } from 'zustand';
import { Asset } from '@/lib/types';
import { createOrUpdateAsset, deleteAsset, syncDBAssets } from '@/lib/actions';
import mixpanel from 'mixpanel-browser';

export interface AssetState {
    assets: Asset[],
    initialized: boolean,
    initState: (assets: Asset[]) => void,
    createAsset: (asset: Partial<Asset>, orgId: string) => Promise<void>,
    updateAsset: (asset: Partial<Asset>, orgId: string) => Promise<void>,
    deleteAsset: (assetId: string) => Promise<void>,
    saveState: () => void,
}

export const useAssetStore = create<AssetState>()(
    temporal((set, get) => ({
            assets: [],
            initialized: false,
            initState: (assets: Asset[]) => {
                set({assets, initialized: true})
            },
            createAsset: async (asset: Partial<Asset>, orgId: string) => {
                const newAsset = await createOrUpdateAsset(asset, orgId)
                console.log(`new asset`, newAsset)

                mixpanel.track("Asset Created", {
                    "ID": newAsset.id,
                    "Name": newAsset.title,
                    "Linked Milestones": (newAsset?.milestones || []).map(({ milestone }) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Milestone Types": (newAsset?.milestones || []).flatMap(({ milestone }) =>
                        (milestone?.types || []).map(type => type.milestoneType.label || type.milestoneType.id)
                    )
                })

                // new Asset first, because Assets are displayed in decending order by creation date
                set({ assets: [newAsset, ...get().assets]})
            },
            updateAsset: async (asset: Partial<Asset>, orgId: string) => {
                const updatedAsset = await createOrUpdateAsset(asset, orgId)
                console.log(`updated asset`, updatedAsset)

                mixpanel.track("Asset Updated", {
                    "ID": updatedAsset.id,
                    "Asset Name": updatedAsset.title,
                    "Linked Milestones": (updatedAsset?.milestones || []).map(({ milestone }) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Milestone Types": (updatedAsset?.milestones || []).flatMap(({ milestone }) =>
                        (milestone?.types || []).map(type => type.milestoneType.label || type.milestoneType.id)
                    )
                })
                set({ assets: get().assets.map(asset => asset.id === updatedAsset.id ? updatedAsset : asset) })
            },
            deleteAsset: async (assetId: string) => {
                const deletedAsset = await deleteAsset(assetId)
                console.log(`deleted asset`, deletedAsset)

                mixpanel.track("Asset Deleted", {
                    "ID": deletedAsset.id,
                    "Asset Name": deletedAsset.title,
                    "Linked Milestones": (deletedAsset?.milestones || []).map(({ milestone }) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Milestone Types": (deletedAsset?.milestones || []).flatMap(({ milestone }) =>
                        (milestone?.types || []).map(type => type.milestoneType.label || type.milestoneType.id)
                    )
                })
                set({ assets: get().assets.filter(asset => asset.id !== deletedAsset.id) })
            },
            saveState: () => {
                console.log(`save state`)
                syncDBAssets({ assets: get().assets })
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
