import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { EditMilestoneForm } from "./edit-milestone-form"
import { useShallow } from "zustand/react/shallow"
import { useEffect, useState } from "react"

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId,
    initialized: state.initialized,
    selectedView: state.selectedView,
    setSelectedView: state.setSelectedView,
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    nodes: state.nodes,
    milestones: state.milestones,
    saveState: state.saveState,
    addMilestones: state.addMilestones
})

export const MilestoneDetailsPanel = ({
    remountKey,
    milestone,
    handlePanelChange
}: {
    remountKey: number,
    milestone: any
    handlePanelChange: (open: boolean) => void
}) => {
    const { 
        selectedNodeId, 
    } = useRoadmapStore(useShallow(selector))
    const [milestoneRemountKey, setMilestoneRemountKey] = useState(1)
    
    useEffect(() => {
        if (selectedNodeId) {
            // remount if the selected node has changed, this will re-initialize the form data
            // without closing the side panel since we're now editing a new node
            setMilestoneRemountKey(prevKey => prevKey + 1)
        }
    }, [selectedNodeId, remountKey])

    const handleClose = () => {
        handlePanelChange(false)
    }

    return (
        <EditMilestoneForm
            // key={milestoneRemountKey}
            milestoneData={milestone}
            onClose={handleClose}
        />
    )
}