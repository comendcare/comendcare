import { ShortlistNav } from "~web/components/shortlist-nav"

export default function ProjectLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="container relative flex flex-col items-center w-full min-w-full">
            <ShortlistNav />
            {children}
        </div>
    )
}