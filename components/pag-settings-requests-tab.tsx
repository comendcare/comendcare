"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getMemberRequestsWithUsers } from "@/lib/fetchers"
import { toast } from "sonner"
import {useSession} from "next-auth/react"
import { ProfilePhoto } from "./profile-photo"
import CreateOrJoinOrganizationButton from "@/components/create-or-join-organization-button"
import MemberRequestsDropdown from "@/components/member-requests-dropdown"
import Loading from "@/app/loading";
import {MemberRequest} from "@prisma/client";

export default function PAGSettingsRequestsTab() {
    const {data: session} = useSession()
    const [memberRequests, setMemberRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)

            if (!session?.user?.organizationId) {
                setLoading(false)
                return
            }

            const response = await getMemberRequestsWithUsers(session.user.organizationId, {
                id: true,
                userId: true,
                email: true,
                role: true,
                organizationId: true,
                createdAt: true,
                updatedAt: true,
                approved: true,
                organization: true,
                user: true
            })

            if (response.success) {
                const unapprovedMemberRequests = response.data?.filter((r: MemberRequest) => !r.approved)
                setMemberRequests(unapprovedMemberRequests ?? [])
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

    if (memberRequests.length === 0) {
        return (
            <div className="h-full w-full flex flex-col mx-auto justify-center items-center">
                <Image
                    alt="No member requests"
                    src="https://illustrations.popsy.co/gray/communication.svg"
                    width={400}
                    height={400}
                    className="dark:hidden"
                />
                <Image
                    alt="No member requests"
                    src="https://illustrations.popsy.co/white/communication.svg"
                    width={400}
                    height={400}
                    className="hidden dark:block"
                />
                <p className="text-3xl p-10">
                    {`Your organization doesn't have any open member requests.`}
                </p>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="sm:flex sm:items-center">
                <div className="space-y-2 sm:flex-auto">
                    <h2 className="text-xl font-semibold leading-6 text-gray-900">
                        Member Requests
                    </h2>
                    <p className="text-sm text-gray-700">
                        Users who have requested access to your organization.
                    </p>
                </div>
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
                                    Requested
                                </th>
                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                            {memberRequests.map((memberRequest) => (
                                <tr key={memberRequest.email}>
                                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                        <div className="flex items-center">
                                            <div className="h-11 w-11 flex-shrink-0">
                                                <ProfilePhoto
                                                    img={memberRequest?.image}
                                                    name={memberRequest?.name}
                                                    className="h-11 w-11 rounded-full"
                                                />
                                            </div>
                                            <div className="ml-4 flex flex-col space-y-1">
                                                <div className="font-bold text-gray-900">
                                                    {memberRequest.user.name}
                                                </div>
                                                <div className="font-medium text-gray-900">
                                                    {memberRequest.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                        {memberRequest.role}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                        {new Date(memberRequest.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                        <MemberRequestsDropdown memberRequest={memberRequest} />
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
