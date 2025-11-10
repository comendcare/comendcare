"use client"
import { Input } from "@/packages/components/ui/input"
import { Label } from "@/packages/components/ui/label"
import { Organization } from "@prisma/client"
// import { getSession } from "@/packages/lib/auth"
// import { redirect } from "next/navigation"
// import prisma from "@comend/lib/prisma"
import Image from "next/image"
import {OrganizationCard} from "comend-pag-platform/components/organization-card"
import { debounce } from "lodash"
import { useCallback, useMemo, useState } from "react"

export default function Organizations({ organizations, searchable = true }: { organizations: Organization[], searchable?: boolean }) {
    const [query, setQuery] = useState('')
    const [filteredOrganizations, setFilteredOrganizations] = useState(organizations)

    const handleInputChangeCallback = useCallback(
        (search: string) => {
            setFilteredOrganizations(organizations.filter(org => org.name?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase())))
        },
        [setFilteredOrganizations]
    )

    const debounceHandleInputChange = useMemo(
        () => debounce(handleInputChangeCallback, 500),
        [handleInputChangeCallback]
    );


    return (organizations && organizations.length > 0) ? (
        <div className="flex flex-col gap-4">
            {searchable && (
                <Input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const search: string = e.target.value
                        setQuery(search)
                        debounceHandleInputChange(search)
                    }}
                />
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredOrganizations.map(organizations => (
                    <OrganizationCard key={organizations.id} data={organizations} />
                ))}
                {filteredOrganizations.length === 0 && (
                    <p className="py-4">No results, please try a different search.</p>
                )}
            </div>
        </div>
    ) : (
        <div className="mt-20 flex flex-col items-center space-x-4">
            <h1 className="font-cal text-4xl">No Organizations Yet</h1>
            <Image
                alt="missing organizations"
                src="https://illustrations.popsy.co/gray/web-design.svg"
                width={400}
                height={400}
            />
            <p className="text-lg text-stone-500">
                You do not have any organizations yet. Create one to get
                started.
            </p>
        </div>
    )
}
