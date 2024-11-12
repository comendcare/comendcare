import {Metadata} from "next"
import {ProjectNav} from "@/components/project-nav"

export const metadata: Metadata = {
    title: "Comend",
    description: "Check out some examples app built using the components."
}

interface ProjectLayoutProps {
    children: React.ReactNode
}

export default function ProjectLayout({children}: ProjectLayoutProps) {
    return (
        <div className="container relative flex flex-col items-center">
            <ProjectNav projectId={""}/>
            {children}
        </div>
    )
}
