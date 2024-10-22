import { cn } from "@/lib/utils"
import AnimatedMarquee from "@/components/animated-marquee"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { LinkPreview } from "@/components/link-preview"
import { Badge } from "@/components/ui/badge"
import librareyLogo from "@/public/logos/librarey-logo.svg"
import Image from "next/image"

// ResourceCard component remains the same
const ResourceCard = ({
    img,
    name,
    href,
    categories,
    description
}: {
    img: string
    name: string
    href: string
    categories: { category: { name: string } }[]
    description: string
}) => {
    return (
        <Link rel="noopener noreferrer" target="_blank" href={href}>
            <figure
                className={cn(
                    "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4 space-y-2",
                    // light styles
                    "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                    // dark styles
                    "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
                )}
            >
                <div className="flex flex-row items-center gap-2">
                    <img
                        className="rounded-full"
                        width="32"
                        height="32"
                        alt=""
                        src={img}
                    />
                    <div className="flex flex-col">
                        <figcaption className="text-sm font-medium dark:text-white">
                            {name}
                        </figcaption>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1">
                    {categories?.map((category, index) => (
                        <Badge key={index}>{category.category.name}</Badge>
                    ))}
                </div>

                <blockquote className="text-sm line-clamp-4">
                    {description}
                </blockquote>
            </figure>
        </Link>
    )
}

export function LibrareySection() {
    const [resources, setResources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch resources using fetch and GraphQL query
    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true)
            const response = await fetch("https://api.rarecomend.com/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `
                        query GetAdminData($orderBy: [ResourceOrderByWithRelationInput!], $take: Int) {
                            resources(orderBy: $orderBy, take: $take) {
                                id
                                name
                                description
                                favicon
                                categories {
                                    category {
                                        name
                                    }
                                }
                            }
                        }
                    `,
                    variables: {
                        orderBy: [{ createdAt: "desc" }],
                        take: 12
                    }
                })
            })

            const { data } = await response.json()
            setResources(data?.resources || [])
            setLoading(false)
        }

        fetchResources()
    }, [])

    if (loading) {
        return <div className="mx-auto w-full max-w-7xl py-32">Loading...</div>
    }

    // Divide the resources into two rows for the marquee
    const firstRow = resources.slice(0, Math.ceil(resources.length / 2))
    const secondRow = resources.slice(Math.ceil(resources.length / 2))

    return (
        <div className="mx-auto w-full max-w-7xl py-24">
            <div className="mx-auto md:w-1/2 px-4 text-center">
                <div>
                    <h2 className="text-lg text-primary mb-2 tracking-wider">
                        Products
                    </h2>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {`Latest from `}
                        <LinkPreview
                            url={"https://www.librarey.com/"}
                            className="hover:underline inline-flex items-baseline"
                            target="_blank"
                        >
                            <Image
                                src={librareyLogo}
                                alt=""
                                className="self-center w-8 h-8 mx-2"
                            />
                            Librarey
                        </LinkPreview>
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        {`What we do at Comend goes beyond tools for patient groups. We're also the team behind Librarey, a search platform for rare disease and disability resources.`}
                    </p>
                </div>
            </div>
            <div className="relative flex flex-col items-center justify-center overflow-hidden">
                <AnimatedMarquee pauseOnHover className="[--duration:30s]">
                    {firstRow.map(resource => (
                        <ResourceCard
                            key={resource.id}
                            img={
                                resource.favicon ||
                                "https://avatar.vercel.sh/placeholder"
                            }
                            name={resource.name}
                            href={`https://www.librarey.com/resource/${resource.id}`}
                            categories={resource.categories.slice(0, 1)}
                            description={resource.description}
                        />
                    ))}
                </AnimatedMarquee>
                <AnimatedMarquee
                    reverse
                    pauseOnHover
                    className="[--duration:30s]"
                >
                    {secondRow.map(resource => (
                        <ResourceCard
                            key={resource.id}
                            img={
                                resource.favicon ||
                                "https://avatar.vercel.sh/placeholder"
                            }
                            name={resource.name}
                            href={`https://www.librarey.com/resource/${resource.id}`}
                            categories={resource.categories.slice(0, 1)}
                            description={resource.description}
                        />
                    ))}
                </AnimatedMarquee>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
            </div>
        </div>
    )
}
