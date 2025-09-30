import { SavedNav } from "~web/components/saved-nav"

export default function ProjectLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="container relative flex flex-col items-start w-full min-w-full p-8 space-y-4">
            <div className="space-y-2 sm:flex-auto">
                <h2 className="text-xl font-semibold leading-6 text-gray-900">
                    Saved
                </h2>
                <p className="text-sm text-gray-700">
                    {`Here are your saved marketplace items.`}
                </p>
            </div>
            <SavedNav className="items-start text-left"/>
            {children}
        </div>
    )
}
