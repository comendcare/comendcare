"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {useSession} from "next-auth/react"
import { getInvitees } from "@/lib/fetchers"
import { toast } from "sonner"
import InviteUserToOrgDialog from "@/components/invite-user-to-org-dialog"
import CreateOrJoinOrganizationButton from "@/components/create-or-join-organization-button"
import { ProfilePhoto } from "./profile-photo"
import InvitationsDropdown from "@/components/invitations-dropdown"
import Loading from "@/app/loading";

export default function PAGSettingsInvitationsTab() {
    const {data: session} = useSession()
    const [invitees, setInvitees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)

            if (!session?.user?.organizationId) {
                setLoading(false)
                return
            }

            const response = await getInvitees(session.user.organizationId)

            if (response.success) {
                setInvitees(response.data ?? [])
            } else {
                console.error(response.error)
                toast.error(response.error)
            }

            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) {
        return <Loading/>
    }

    if (!session?.user?.organizationId) {
        return (
            <div className="h-full flex flex-col items-center justify-center py-20">
                <Image
                    alt="missing organization"
                    src="https://illustrations.popsy.co/gray/success.svg"
                    width={400}
                    height={400}
                    className="dark:hidden"
                />
                <Image
                    alt="missing organization"
                    src="https://illustrations.popsy.co/white/success.svg"
                    width={400}
                    height={400}
                    className="hidden dark:block"
                />
                <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                    {`You're not part of an organization yet.`}
                </p>
                <div className="mt-8">
                    <CreateOrJoinOrganizationButton />
                </div>
            </div>
        )
    }

    if (invitees.length === 0) {
        return (
            <div className="h-full w-full flex flex-col mx-auto justify-center items-center">
                <Image
                    alt="No open invitations"
                    src="https://illustrations.popsy.co/gray/paper-plane.svg"
                    width={400}
                    height={400}
                    className="dark:hidden"
                />
                <Image
                    alt="No open invitations"
                    src="https://illustrations.popsy.co/white/paper-plane.svg"
                    width={400}
                    height={400}
                    className="hidden dark:block"
                />
                <p className="text-3xl p-10">
                    {`Your organization doesn't have any open invitations.`}
                </p>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="sm:flex sm:items-center">
                <div className="space-y-2 sm:flex-auto">
                    <h2 className="text-xl font-semibold leading-6 text-gray-900">Invitations</h2>
                    <p className="text-sm text-gray-700">All open invitations sent by your organization.</p>
                </div>
                <InviteUserToOrgDialog />
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                            <tr>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                    Email
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Role
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Invited
                                </th>
                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                            {invitees.map((person) => (
                                <tr key={person.email}>
                                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                        <div className="flex items-center">
                                            <div className="h-11 w-11 flex-shrink-0">
                                                <ProfilePhoto
                                                    img={person?.image}
                                                    name={person?.name}
                                                    className="h-11 w-11 rounded-full"
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-medium text-gray-900">{person.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="capitalize whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                        {person.role}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                        {new Date(person.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                        <InvitationsDropdown invitation={person} />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
