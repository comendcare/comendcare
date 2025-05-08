"use client"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronRight, House } from "lucide-react"

export default function Breadcrumbs() {
    // const router = useRouter();
    const pathWithoutAnchor = usePathname().split("#")[0]
    const pathSegments = pathWithoutAnchor.split("/").filter(segment => segment.length > 0)

    // Mapping URL segments to breadcrumb format
    const pages = pathSegments.map((segment, index, array) => {
        const href = "/" + array.slice(0, index + 1).join("/")
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
                <li>
                    <div>
                        <Link href="/" className="text-gray-400 hover:text-gray-500">
                            <House className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </div>
                </li>
                {pages.map(page => (
                    <li key={page.name}>
                        <div className="flex items-center">
                            <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
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
