import {Metadata} from "next"

export const metadata: Metadata = {
    title: "RareSearch",
    description: "Check out some examples app built using the components.",
}

interface AppLayoutProps {
    children: React.ReactNode
}

export default function AppLayout({children}: AppLayoutProps) {

    return (
        <div className="container relative">
            {children}
        </div>
    )
}
