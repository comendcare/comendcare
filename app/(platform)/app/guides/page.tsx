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
import { Blog, BlogCard } from "@/components/layout/sections/news"
import Loading from "@/app/loading"

export default function FAQ() {
    const [filteredPages, setFilteredPages] = useState<Blog[]>([])

    useEffect(() => {
        const init = async () => {
            const faqDBKey = '1f3801a6fddc8010b610f8175f5cccf9'
            const {pages} = await getNotionDatabaseAndContents(faqDBKey, {sorts: [{property: 'Order', direction: 'ascending'}]})

            const filteredPages: Blog[] = pages
                .map((page: any) => {
                    // depending on the page Status, show or hide it
                    if (process.env.NEXT_PUBLIC_NODE_ENV === 'production' && !(page?.properties?.["Status"]?.status?.name === 'Published (in production)')) {
                        return null
                    }

                    // if (process.env.NEXT_PUBLIC_NODE_ENV === 'development' && !(page?.properties?.["Status"]?.status?.name === 'Published (in production)' || page?.properties?.["Status"]?.status?.name === 'Ready to Deploy (in preview)')) {
                    //     return null
                    // }

                    const title = page?.properties?.["Name"]?.title?.map((text: any) => text?.plain_text)?.join(" ")
                    const description = page.properties["Description"].rich_text.map((text: any) => text.plain_text).join("\n")
                    const slug = `/app/guides/${page.id}`
                    const image = page?.cover?.external?.url || page?.cover?.file?.url || ''
                    const author = page.properties["Author"].people[0].name
                    const authorAvatar = page.properties["Author"].people[0].avatar_url
                    const publishDate = new Date(page.properties["Publication Date"].date.start)
                    const section = page.properties.Section.select.name

                    if (!title || !slug || !author || !authorAvatar || !publishDate) return null
                    return {title, description: description || '', slug, image, author, authorAvatar, date: publishDate, section}
                })
                .filter((page) => page !== null)
                .sort((a, b) => b.date.valueOf() - a.date.valueOf())

            setFilteredPages(filteredPages)
        }

        init()
    }, [])

    if (filteredPages.length <= 0) return <Loading />

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

            <FAQSections pages={filteredPages} />
        </div>
    )
}

function FAQSections({pages}: {pages: Blog[]}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [filterState, setFilterState] = useState(searchParams.get("view") || "Onboarding Guides")

    const handleSetFilterState = (state: TagType) => {
        // const params = new URLSearchParams(searchParams.toString())
        // params.delete("view")

        // if (state) {
        //     params.set("view", state)
        //     router.push(`${pathname}?${params.toString()}`, { scroll: false })
        // }

        setFilterState(state)
    }

    return (
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
                    value="Onboarding Guides"
                >
                    <div className="w-full flex flex-row items-center justify-start gap-4">
                        <Lightbulb className="min-w-8 w-8 min-h-8 h-8" />
                        <div className="flex flex-col items-start text-start">
                            <h3 className="text-lg">Onboarding Guides</h3>
                            <p className="mt-1 text-sm text-gray-500">How to get started with Comend</p>
                        </div>
                    </div>
                </ToggleGroupItem>
                <ToggleGroupItem
                    variant="outline"
                    className="p-4 h-full"
                    value="Organization Profile Guides"
                >
                    <div className="w-full flex flex-row items-center justify-start gap-4">
                        <ThumbsUp className="min-w-8 w-8 min-h-8 h-8" />
                        <div className="flex flex-col items-start text-start">
                            <h3 className="text-lg">Organization Profile Guides</h3>
                            <p className="mt-1 text-sm text-gray-500">{`How to set up your organiation's profile`}</p>
                        </div>
                    </div>
                </ToggleGroupItem>
                <ToggleGroupItem
                    variant="outline"
                    className="p-4 h-full"
                    value="Research Planner Guides"
                >
                    <div className="w-full flex flex-row items-center justify-start gap-4">
                        <Save className="min-w-8 w-8 min-h-8 h-8" />
                        <div className="flex flex-col items-start text-start">
                            <h3 className="text-lg">Research Planner Guides</h3>
                            <p className="mt-1 text-sm text-gray-500">How to setup and create research plans for your organization</p>
                        </div>
                    </div>
                </ToggleGroupItem>
            </ToggleGroup>

            <h2 className="text-2xl">
                {filterState === "Onboarding Guides" && `Onboarding Guides`}
                {filterState === "Organization Profile Guides" && `Organization Profile Guides`}
                {filterState === "Research Planner Guides" && `Research Planner Guides`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages
                    .filter((page: any) => page.section === filterState)
                    .map((page: any, index) => {
                        return (
                            <BlogCard 
                                blog={page}
                                key={index} 
                                showFullDescription={true}
                            />
                        )
                })}
            </div>
        </div>
    )
}
