import { TeamSection } from "@/components/layout/sections/team-section"
import { TimelineSection } from "@/components/layout/sections/timeilne-section"
import { PartneredWithLogoCloud } from "@/components/layout/sections/partnered-with-logo-cloud"

export default function AboutPage() {
    return (
        <>
            <TimelineSection />
            <PartneredWithLogoCloud />
            <TeamSection />
        </>
    )
}
