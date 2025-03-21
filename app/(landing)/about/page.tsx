import { TeamSection } from "@/components/layout/sections/team-section"
import { TimelineSection } from "@/components/layout/sections/timeilne-section"
import { PartneredWithLogoCloud } from "@/components/layout/sections/partnered-with-logo-cloud"
import About from "@/components/layout/sections/about";

export default function AboutPage() {
    return (
        <>
            {/*<TimelineSection />*/}
            <About/>
            <PartneredWithLogoCloud />
            <TeamSection />
        </>
    )
}
