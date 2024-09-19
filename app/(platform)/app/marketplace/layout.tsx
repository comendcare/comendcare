import {Metadata} from "next"
import {ProjectNav} from "@/components/project-nav";

export const metadata: Metadata = {
    title: "RareSearch",
    description: "Check out some examples app built using the components.",
}

interface ProjectLayoutProps {
    children: React.ReactNode
    params: { projectId: string }
}

export default function ProjectLayout({children, params}: ProjectLayoutProps) {

    return (
        <div className="container relative">
            {children}
        </div>
    )
}