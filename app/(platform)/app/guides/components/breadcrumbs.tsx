"use client"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronRight, House } from "lucide-react"

export default function Breadcrumbs() {
    // const router = useRouter();
    const pathWithoutAnchor = usePathname().split("#")[0]
    const pathSegments = pathWithoutAnchor.split("/").filter(segment => segment.length > 0)

    // Mapping URL segments to breadcrumb format
    const pages = pathSegments.splice(1, pathSegments.length).map((segment, index, array) => {
        const href = "/app/" + array.slice(0, index + 1).join("/")
        const isCurrent = index === array.length - 1

        // Capitalize the segment for display
        const name = segment.replace(/-/g, " ").replace(/^\w/, c => c.toUpperCase())

        return { name, href, current: isCurrent }
    })

    // Optionally, add a home page link
    // pages.unshift({ name: 'Home', href: '/', current: false })

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-4">
                {pages.map((page, index) => (
                    <li key={page.name}>
                        <div className="flex items-center">
                            {index > 0 && <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />}
                            <a
                                href={page.href}
                                className={`${page.current ? "font-semibold leading-7 text-blue-600" : "font-medium text-gray-500 hover:text-gray-700"} text-sm ml-4 `}
                                aria-current={page.current ? "page" : undefined}
                            >
                                {page.name}
                            </a>
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    )
}
