"use client"

<<<<<<< HEAD
const FAQs = [
    // {
    //     question: "Where does our data come from?",
    //     answer:
    //         "We have seeded our network using existing databases like PubMed. Soon, researchers and contractors will be able to claim and edit their pages.",
    //     contactLink: false,
    // },
    {
        question: "What does it cost?",
        answer:
            "Comend is free for patient groups. We make money by helping biopharma identify opportunities in rare diseases.",
        contactLink: true,
    },
    {
        question: "What do we do with your data?",
        answer:
            "In short — only what you consent to! We can currently collect and analyze data to improve our product, identify successful research strategies, and make the case for biopharma initiatives to support rare disease research. Note: Comend does not currently store patient-level data.",
        contactLink: false,
    },
    {
        question: "Why are we doing this?",
        answer:
            "We are a team of technology enthusiasts, rare disease parents, and citizen scientists who wish to improve the social processes of science and recognize that patient advocates are uniquely suited to lead the next generation of drug development.",
        contactLink: false,
    },
    {
        question: "What happens if we shut down?",
        answer: "We’ve seen companies wind down in the rare disease space and understand how big of a set back that can be to you and your community. We are committed to preserving and returning your data as much as possible and will be forthright about significant risks to our operations.",
        contactLink: false
    },
    {
        question: `What does "Comend" mean?`,
        answer:
            "Pronounced “KH-oh-mend”, Comend means to work together to fix things. \n" +
            "\n" +
            "We bring together the rare community and traditional life sciences ecosystem to forge a path toward precision medicines at scale.",
        contactLink: false,
    },
  ];
=======
import React, { useState } from "react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Questions from "@/components/faq/questions"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import PreviewCard from "@/components/faq/preview-card"
import { FaClipboardCheck, FaFloppyDisk, FaLightbulb, FaThumbsUp } from "react-icons/fa6"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArticleType, TagType } from "@/lib/types"

const articles: ArticleType[] = []
const imgWidth = 400
const imgHeight = 250

export default function FAQ() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [filterState, setFilterState] = useState(searchParams.get("view") || "start")

    const handleSetFilterState = (state: TagType) => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete("view")

        if (state) {
            params.set("view", state)
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }

        setFilterState(state)
    }
>>>>>>> 39f62649 (add basic Librarey fAQ styling)

    return (
        <div className="mx-auto space-y-16">
            <div className="bg-blue-100 rounded-xl">
                <div className="mx-auto max-w-7xl px-6 py-8 sm:py-16 md:py-32 flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {`Frequently asked questions`}
                            <br />
                        </h2>
                        <p className="mt-2 text-2xl text-gray-500">{`How can we help?`}</p>
                    </div>
                    <Link href="/contact" className={cn("w-fit")}>
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
                        className="px-10 py-4 h-full"
                        value="start"
                    >
                        <div className="flex flex-row items-center space-x-4">
                            <FaLightbulb className="w-8 h-8" />
                            <div className="flex flex-col items-start text-start">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">Getting Started</h3>
                                <p className="mt-1 text-sm text-gray-500">Start from the beginning</p>
                            </div>
                        </div>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        variant="outline"
                        className="px-10 py-4 h-full"
                        value="contribute"
                    >
                        <div className="flex flex-row items-center space-x-4">
                            <FaThumbsUp className="w-8 h-8" />
                            <div className="flex flex-col items-start text-start">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">Uploading Resources</h3>
                                <p className="mt-1 text-sm text-gray-500">How to start contributing</p>
                            </div>
                        </div>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        variant="outline"
                        className="px-10 py-4 h-full"
                        value="collections"
                    >
                        <div className="flex flex-row items-center space-x-4">
                            <FaFloppyDisk className="w-8 h-8" />
                            <div className="flex flex-col items-start text-start">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">Create Collection and Embed</h3>
                                <p className="mt-1 text-sm text-gray-500">{`Create and add collection to your site`}</p>
                            </div>
                        </div>
                    </ToggleGroupItem>
                    {/* <ToggleGroupItem
                        variant="outline"
                        className="p-10"
                        value="rules"
                    >
                        <div className="flex flex-row items-center space-x-4">
                            <FaClipboardCheck className="w-8 h-8" />
                            <div className="flex flex-col items-start text-start">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">Rules and Policies</h3>
                                <p className="mt-1 text-sm text-gray-500">{`Learn about Librarey's rules`}</p>
                            </div>
                        </div>
                    </ToggleGroupItem> */}
                </ToggleGroup>

                <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
                    {filterState === "start" && `Getting Started`}
                    {filterState === "contribute" && `Uploading Resources`}
                    {filterState === "collections" && `Create Collection and Embed`}
                    {/* {filterState === "rules" && `Rules and Policies`} */}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {articles
                        .filter((article: any) => article.tags.includes(filterState as TagType))
                        .map((article: any, index: number) => (
                            <PreviewCard
                                key={index}
                                index={index}
                                article={article}
                                imgWidth={imgWidth}
                                imgHeight={imgHeight}
                            />
                        ))}
                </div>
            </div>

            <Questions />
        </div>
    )
}