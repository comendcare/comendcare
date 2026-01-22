import prisma from "../prisma"

/* 
    https://www.notion.so/comend/Manage-public-private-status-as-property-of-research-plan-2ee801a6fddc80129094fe8e73111129?source=copy_link

    In this ticket we're adding the 'private' property to research plans, and we will be internally managing it in actions.ts when milestones are updated.
    This solution works for new research plans and editing research plans. However, we need to update the 'private' property of existing research plans based
        on the visibility of their existing milestones. The migration sets all roadmaps to private by default, but some of them we want to be public.
*/
const updateVisibilityValues = async () => {
    const roadmaps = await prisma.roadmap.findMany()

    await Promise.all(roadmaps.map(async (roadmap) => {
        const allMilestones = await prisma.milestone.findMany({
            where: {roadmapId: roadmap.id}
        })
        let roadmapPublishStatus = false
        allMilestones.forEach(milestone => {
            roadmapPublishStatus = roadmapPublishStatus || !milestone.private
        })

        const updatedResearchPlan = await prisma.roadmap.update({
            where: {id: roadmap.id},
            data: {private: !roadmapPublishStatus}
        })

        console.log(`updatedResearchPlan`, updatedResearchPlan)
    }))
}

updateVisibilityValues()