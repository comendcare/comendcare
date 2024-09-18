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
            {/*<div className="fixed left-0 top-10 w-full bg-white min-h-40 z-10">*/}
            {/*    <AppNav/>*/}
            {/*</div>*/}
            {children}
        </div>
    )
}
