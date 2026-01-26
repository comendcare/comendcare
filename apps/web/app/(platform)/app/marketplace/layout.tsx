import {MarketplaceNav} from "@comend/components/marketplace/marketplace-nav"

interface ProjectLayoutProps {
    children: React.ReactNode
}

export default function MarketplaceLayout({children}: ProjectLayoutProps) {

    return (
        <div className="w-full flex justify-center">
            <div className="max-w-7xl h-full w-full flex flex-col items-center p-8 gap-4 md:gap-8">
                <MarketplaceNav />
                {children}
            </div>
        </div>
    )
}

