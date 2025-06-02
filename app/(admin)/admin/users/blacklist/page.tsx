import {Suspense} from "react"
import PlaceholderCard from "@/components/placeholder-card"
import {AdminUsersNav} from "@/components/admin-users-nav";
import * as React from "react"
import {BlacklistDataTable} from "@/components/blacklist-data-table/blacklist-data-table";
import {BlacklistDialog} from "@/components/blacklist-data-table/blacklist-dialog";

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
                        All Blacklisted Emails
                    </h1>
                    <BlacklistDialog />
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
                    <BlacklistDataTable />
                </Suspense>
            </div>
        </div>
    )
}
