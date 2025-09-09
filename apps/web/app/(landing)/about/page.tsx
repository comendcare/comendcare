import { TeamSection } from "~web/components/landing/team-section"
import { PartneredWithLogoCloud } from "~web/components/landing/partnered-with-logo-cloud"
import About from "~web/components/landing/about";
import {News} from "~web/components/landing/news";

export default function AboutPage() {
    return (
        <>
            {/*<TimelineSection />*/}
            <About/>
            <PartneredWithLogoCloud />
            <TeamSection />
            <News />
        </>
    )
}
