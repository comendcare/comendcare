import {Suspense} from "react"
import PlaceholderCard from "@/components/placeholder-card"
import {AdminUsersNav} from "@/components/admin-users-nav";
import * as React from "react"
import {WhitelistDialog} from "@/components/whitelist-data-table/whitelist-dialog";
import { WhitelistDataTable } from "@/components/whitelist-data-table/whitelist-data-table"

export default function AdminUserWhitelist({
                                               params
                                           }: {
    params: { id: string }
}) {
    return (
        <div className="mx-auto flex max-w-screen-xl flex-col space-y-12 p-8">
            <AdminUsersNav/>
            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-cal text-3xl font-bold dark:text-white">
                        All Whitelisted Emails
                    </h1>
                    <WhitelistDialog />
                </div>
                <Suspense
                    fallback={
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({length: 8}).map((_, i) => (
                                <PlaceholderCard key={i}/>
                            ))}
                        </div>
                    }
                >
                    <WhitelistDataTable />
                </Suspense>
            </div>
        </div>
    )
}
