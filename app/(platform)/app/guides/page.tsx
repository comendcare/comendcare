"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Questions from "./components/questions"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import PreviewCard from "./components/preview-card"
import { articles, imgHeight, imgWidth } from "@/lib/articles"
import type { TagType } from "@/lib/articles"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Lightbulb, Save, ThumbsUp } from "lucide-react"
import { getNotionDatabaseAndContents } from "@/lib/notion"
import Loading from "@/app/loading"

// const faqs = [
//     {
//         question: `How do I use Librarey?`,
//         answer: `Right now, our search bar uses keywords. It's semantic search, meaning it works a bit differently from Google (vector search). Results will return based purely on keyword matches rather than on the whim of some algorithm. You can filter results by category and location and sort them alphabetically or by newest added. Lots of new functionalities and improvements are in the works, but if you have any ideas for features or are running into issues with Librarey, we’d love to hear about them!`
//     },
//     {
//         question: `What are accounts for?`,
//         answer: `Accounts are needed for proposing a new resource, proposing an improvement to an existing resource, to leave comments and replies, create collections, and many more features. This is because we need to be able to vet and verify proposals and link content to an individual. You don't need an account to use the search and filter features.`
//     },
//     {
//         question: `Do you make money? How?`,
//         answer: `Librarey doesn’t make any money right now, but we aim to! We’re still figuring out a model that is best aligned with the needs of the rare disease community, but know that **Librarey will always be completely free for families.**  If you have any advice on this matter or would like to sponsor our work, please reach out!`
//     },
//     {
//         question: `What's next? Where is this going?`,
//         answer: `We're continuing to develop and support Librarey with more features that we build as we gather feedback from the community. Features like community contributions, comments and discussions, and much more are under development. We're working on a way to present a product roadmap for future updates.`
//     }
// ]

export default async function FAQ() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [filterState, setFilterState] = useState(searchParams.get("view") || "Sample")
    const [filteredPages, setFilteredPages] = useState<any[]>([])

    const handleSetFilterState = (state: TagType) => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete("view")

        if (state) {
            params.set("view", state)
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }

        setFilterState(state)
    }

    useEffect(() => {
        const init = async () => {
            const faqDBKey = '1f3801a6fddc8010b610f8175f5cccf9'
            const {database, pages} = await getNotionDatabaseAndContents(faqDBKey)

            const filteredPages = (
                process.env.NEXT_PUBLIC_NODE_ENV === 'production'
                    ? pages
                        .filter((page: any) => page.properties.Status.type === 'status' && page.properties.Status.status === 'Published (in production)')
                        .filter((page: any) => page.properties.Section)
                        .filter((page: any) => page.public_url)
                    : pages
                        .filter((page: any) => page.properties.Section)
                        .filter((page: any) => page.public_url)
            )

            setFilteredPages(filteredPages)
        }
        init()
    }, [])

    // const faqDBKey = '1f3801a6fddc8010b610f8175f5cccf9'
    // const {database, pages} = await getNotionDatabaseAndContents(faqDBKey)

    // const filteredPages = (
    //     process.env.NEXT_PUBLIC_NODE_ENV === 'production'
    //         ? pages
    //             .filter((page: any) => page.properties.Status.type === 'status' && page.properties.Status.status === 'Published (in production)')
    //             .filter((page: any) => page.properties.Section)
    //             .filter((page: any) => page.public_url)
    //         : pages
    //             .filter((page: any) => page.properties.Section)
    //             .filter((page: any) => page.public_url)
    // )

    if (!filteredPages) return <Loading />

    return (
        <div className="mx-auto space-y-16">
            <div className="bg-blue-light rounded-xl">
                <div className="mx-auto max-w-7xl px-6 py-8 sm:py-16 md:py-32 flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                    <div>
                        <h2 className="text-2xl tracking-tight text-gray-900 sm:text-3xl">
                            {`Frequently asked questions`}
                            <br />
                        </h2>
                        <p className="mt-2 text-xl text-gray-500">{`How can we help?`}</p>
                    </div>
                    <Link href="/contact" className={cn(buttonVariants({ variant: "cta" }), "w-fit")}>
                        {`Contact us`}
                    </Link>
                </div>
            </div>

            <div className="space-y-6">
                <ToggleGroup
                    type="single" 
                    variant="outline" 
                    value={filterState} 
                    onValueChange={(value: TagType) => { if (value) handleSetFilterState(value) }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    <ToggleGroupItem
                        variant="outline"
                        className="p-4 h-full"
                        value="start"
                    >
                        <div className="w-full flex flex-row items-center justify-start gap-4">
                            <Lightbulb className="min-w-8 w-8 min-h-8 h-8" />
                            <div className="flex flex-col items-start text-start">
                                <h3 className="text-lg">Sample</h3>
                                <p className="mt-1 text-sm text-gray-500">Sample Pages</p>
                            </div>
                        </div>
                    </ToggleGroupItem>
                    {/* <ToggleGroupItem
                        variant="outline"
                        className="p-4 h-full"
                        value="contribute"
                    >
                        <div className="w-full flex flex-row items-center justify-start gap-4">
                            <ThumbsUp className="min-w-8 w-8 min-h-8 h-8" />
                            <div className="flex flex-col items-start text-start">
                                <h3 className="text-lg">Uploading Resources</h3>
                                <p className="mt-1 text-sm text-gray-500">How to start contributing</p>
                            </div>
                        </div>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        variant="outline"
                        className="p-4 h-full"
                        value="collections"
                    >
                        <div className="w-full flex flex-row items-center justify-start gap-4">
                            <Save className="min-w-8 w-8 min-h-8 h-8" />
                            <div className="flex flex-col items-start text-start">
                                <h3 className="text-lg">Create Collection and Embed</h3>
                                <p className="mt-1 text-sm text-gray-500">Create and add collection to your site</p>
                            </div>
                        </div>
                    </ToggleGroupItem> */}
                </ToggleGroup>

                <h2 className="text-2xl">
                    {filterState === "Sample" && `Sample Pages`}
                    {/* {filterState === "contribute" && `Uploading Resources`}
                    {filterState === "collections" && `Create Collection and Embed`} */}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPages
                        .filter((page: any) => page.properties.Section.select.name === filterState)
                        .map((page, index) => (
                            // <PreviewCard
                            //     key={index}
                            //     index={index}
                            //     article={article}
                            //     imgWidth={imgWidth}
                            //     imgHeight={imgHeight}
                            // />
                            <p>{JSON.stringify(page)}</p>
                        ))}
                </div>
            </div>
        </div>
    )
}
