import { temporal } from 'zundo';
import { create } from 'zustand';
import { RFP } from '@/lib/types';
import { createOrUpdateRFP, deleteRFP, syncDBRFPs } from '@/lib/actions';

export interface RFPState {
    rfps: RFP[],
    initialized: boolean,
    initState: (rfps: RFP[]) => void,
    createRFP: (rfp: Partial<RFP>, orgId: string) => Promise<void>,
    updateRFP: (rfp: Partial<RFP>, orgId: string) => Promise<void>,
    deleteRFP: (rfpId: string) => Promise<void>,
    saveState: () => void,
}

export const useRFPStore = create<RFPState>()(
    temporal((set, get) => ({
            rfps: [],
            initialized: false,
            initState: (rfps: RFP[]) => {
                set({rfps, initialized: true})
            },
            createRFP: async (rfp: Partial<RFP>, orgId: string) => {
                const newRfp: RFP = await createOrUpdateRFP(rfp, orgId)
                console.log(`new rfp`, newRfp)
                set({ rfps: [...get().rfps, newRfp]})
            },
            updateRFP: async (rfp: Partial<RFP>, orgId: string) => {
                const updatedRfp: RFP = await createOrUpdateRFP(rfp, orgId)
                console.log(`updated rfp`, updatedRfp)
                set({ rfps: get().rfps.map(rfp => rfp.id === updatedRfp.id ? updatedRfp : rfp) })
            },
            deleteRFP: async (rfpId: string) => {
                const deletedRfp: RFP = await deleteRFP(rfpId)
                console.log(`deleted rfp`, deletedRfp)
                set({ rfps: get().rfps.filter(rfp => rfp.id !== deletedRfp.id) })
            },
            saveState: () => {
                console.log(`save state`)
                syncDBRFPs({ rfps: get().rfps })
            }
        }),
        {
            limit: 1, // limit the stored history states to 1 since we're only using this for the undo button right now
            onSave: (pastState, currentState) => {
                console.log(`Saved rfps state: `, currentState)
                return
            },
        })
    )
