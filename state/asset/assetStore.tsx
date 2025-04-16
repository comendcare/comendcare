import { temporal } from 'zundo';
import { create } from 'zustand';
import { Asset } from '@/lib/types';
import { createOrUpdateAsset, deleteAsset, syncDBAssets } from '@/lib/actions';

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
                const newAsset: Asset = await createOrUpdateAsset(asset, orgId)
                console.log(`new asset`, newAsset)
                set({ assets: [...get().assets, newAsset]})
            },
            updateAsset: async (asset: Partial<Asset>, orgId: string) => {
                const updatedAsset: Asset = await createOrUpdateAsset(asset, orgId)
                console.log(`updated asset`, updatedAsset)
                set({ assets: get().assets.map(asset => asset.id === updatedAsset.id ? updatedAsset : asset) })
            },
            deleteAsset: async (assetId: string) => {
                const deletedAsset: Asset = await deleteAsset(assetId)
                console.log(`deleted asset`, deletedAsset)
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
