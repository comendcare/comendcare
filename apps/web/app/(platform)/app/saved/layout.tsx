import { SavedNav } from "~web/components/saved-nav"

export default function ProjectLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="container relative flex flex-col items-center w-full min-w-full pt-4">
            <SavedNav />
            {children}
        </div>
    )
}
