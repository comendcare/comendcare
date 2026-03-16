import { temporal } from 'zundo';
import { create } from 'zustand';
import { RFP } from '@comend/lib/types';
import { createOrUpdateRFP, deleteRFP, syncDBRFPs } from '@comend/lib/actions';
import { mixpanelTrack } from "@comend/lib/mixpanel";

export interface RFPState {
    rfps: RFP[],
    initialized: boolean,
    initState: (rfps: RFP[]) => void,
    createRFP: (rfp: Partial<RFP>, orgId: string) => Promise<RFP | undefined>,
    updateRFP: (rfp: Partial<RFP>, orgId: string) => Promise<RFP | undefined>,
    deleteRFP: (rfpId: string, orgId: string) => Promise<void>,
    saveState: (orgId: string | null | undefined) => void,
}

export const useRFPStore = create<RFPState>()(
    temporal((set, get) => ({
            rfps: [],
            initialized: false,
            initState: (rfps: RFP[]) => {
                set({rfps, initialized: true})
            },
            createRFP: async (rfp: Partial<RFP>, orgId: string) => {
                const newRfp = await createOrUpdateRFP(orgId, rfp)
                console.log(`new rfp`, newRfp)

                mixpanelTrack("RFP Created", {
                    "ID": newRfp.id,
                    "Name": newRfp.title,
                    "Budget": newRfp.budget,
                    "Linked Projects": newRfp.milestones.map(({ milestone }: {milestone: any}) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Project Types": newRfp.milestones.flatMap(({ milestone }: {milestone: any}) =>
                        milestone.types.map((type: any) => type.milestoneType.label || type.milestoneType.id)
                    )
                })
                
                // new RFP first, because RFPs are displayed in decending order by creation date
                set({ rfps: [newRfp, ...get().rfps]})
                console.log(`successfully created RFP`)
                return newRfp
            },
            updateRFP: async (rfp: Partial<RFP>, orgId: string) => {
                const updatedRfp = await createOrUpdateRFP(orgId, rfp)
                console.log(`updated rfp`, updatedRfp)

                mixpanelTrack("RFP Updated", {
                    "ID": updatedRfp.id,
                    "Name": updatedRfp.title,
                    "Budget": updatedRfp.budget,
                    "Linked Projects": updatedRfp.milestones.map(({ milestone }: {milestone: any}) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Project Types": updatedRfp.milestones.flatMap(({ milestone }: {milestone: any}) =>
                        milestone.types.map((type: any) => type.milestoneType.label || type.milestoneType.id)
                    )
                })

                set({ rfps: get().rfps.map(rfp => rfp.id === updatedRfp.id ? updatedRfp : rfp) })
                console.log(`successfully updated RFP`)
                return updatedRfp
            },
            deleteRFP: async (rfpId: string, orgId: string) => {
                const deletedRfp = await deleteRFP(orgId, rfpId)
                console.log(`deleted rfp`, deletedRfp)

                mixpanelTrack("RFP Deleted", {
                    "ID": deletedRfp.id,
                    "Name": deletedRfp.title,
                    "Budget": deletedRfp.budget,
                    "Linked Projects": deletedRfp.milestones.map(({ milestone }: {milestone: any}) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Project Types": deletedRfp.milestones.flatMap(({ milestone }: {milestone: any}) =>
                        milestone.types.map((type: any) => type.milestoneType.label || type.milestoneType.id)
                    )
                })

                set({ rfps: get().rfps.filter(rfp => rfp.id !== deletedRfp.id) })
                console.log(`successfully deleted RFP`)
            },
            saveState: (orgId: string | null | undefined) => {
                syncDBRFPs(orgId, { rfps: get().rfps })
            }
        }),
        {
            limit: 1, // limit the stored history states to 1 since we're only using this for the undo button right now
        })
    )
