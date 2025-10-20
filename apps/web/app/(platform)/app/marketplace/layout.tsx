"use client"
import {MarketplaceNav} from "~web/components/marketplace/marketplace-nav"

// export const metadata: Metadata = {
//     title: "Comend",
//     description: "Check out some examples app built using the components."
// }

interface ProjectLayoutProps {
    children: React.ReactNode
}

export default function MarketplaceLayout({children}: ProjectLayoutProps) {
    // if (organization && !organization?.published) {
    //     return <div className="h-full flex flex-col mx-auto items-center justify-center py-20">
    //         <Image
    //             alt="Organization not published"
    //             src="https://illustrations.popsy.co/gray/meditation-girl.svg"
    //             width={400}
    //             height={400}
    //             className="dark:hidden"
    //         />
    //         <Image
    //             alt="Organization not published"
    //             src="https://illustrations.popsy.co/white/meditation-girl.svg"
    //             width={400}
    //             height={400}
    //             className="hidden dark:block"
    //         />
    //         <p className="text-center font-title text-2xl text-stone-600 dark:text-stone-400">
    //             {`Your organization isn't published yet.`}
    //         </p>
    //         <p className="text-center mt-4 text-stone-500 dark:text-stone-300 max-w-xl">
    //             {`To access the marketplace you need to publish your organization. Only published organizations can view and be shown in the marketplace.`}
    //         </p>
    //     </div>
    // }

    return (
        <div className="w-full flex justify-center">
            <div className="max-w-7xl h-full w-full flex flex-col items-center p-8 gap-4 md:gap-8">
                <MarketplaceNav />
                {children}
            </div>
        </div>
    )
}

