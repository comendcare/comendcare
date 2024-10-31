import {cookies} from "next/headers"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {FaUserPlus, FaUserXmark} from "react-icons/fa6";
import InviteUserToOrgDialog from "@/components/invite-user-to-org-dialog";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import OrganizationSettingsTab from "@/components/organization-settings-tab";
import { getSession } from "@/lib/auth"
import {faker} from "@faker-js/faker";
import {createDicebearAvatar} from "@/lib/utils";

const members = [
    {
        name: 'Alice Johnson',
        department: 'Research',
        email: 'alice.johnson@example.com',
        role: 'Member',
        image:
            'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?crop=faces&w=256&h=256&q=80',
        invitedDate: '2024-08-12T14:30:00Z',
    },
    {
        name: 'Bob Smith',
        department: 'Engineering',
        email: 'bob.smith@example.com',
        role: 'Member',
        image:
            'https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=faces&w=256&h=256&q=80',
        invitedDate: '2024-09-15T09:45:00Z',
    },
    {
        name: 'Charlie Nguyen',
        department: 'Product Development',
        email: 'charlie.nguyen@example.com',
        role: 'Admin',
        image:
            'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?crop=faces&w=256&h=256&q=80',
        invitedDate: '2024-07-23T12:00:00Z',
    },
    {
        name: 'Dana Lee',
        department: 'Marketing',
        email: 'dana.lee@example.com',
        role: 'Admin',
        image:
            'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?crop=faces&w=256&h=256&q=80',
        invitedDate: '2024-06-30T17:15:00Z',
    },
    {
        name: 'Ethan Kim',
        department: 'Sales',
        email: 'ethan.kim@example.com',
        role: 'Member',
        image:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=faces&w=256&h=256&q=80',
        invitedDate: '2024-05-18T08:30:00Z',
    },
];
//
// const invitees = [
//     {
//         name: 'Sophia Martinez',
//         email: 'sophia.martinez@example.com',
//         role: 'Member',
//         image:
//             'https://images.unsplash.com/photo-1517841905240-472988babdf9?crop=faces&w=256&h=256&q=80',
//         invitedDate: '2024-10-01T10:00:00Z',
//     },
//     {
//         name: 'Liam O’Connor',
//         email: 'liam.oconnor@example.com',
//         role: 'Admin',
//         image:
//             'https://images.unsplash.com/photo-1599566150163-29194dcaad36?crop=faces&w=256&h=256&q=80',
//         invitedDate: '2024-09-29T13:15:00Z',
//     },
//     {
//         name: 'Emma Williams',
//         email: 'emma.williams@example.com',
//         role: 'Member',
//         image:
//             'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?crop=faces&w=256&h=256&q=80',
//         invitedDate: '2024-09-25T09:45:00Z',
//     },
// ];


export default async function ProfilePage() {
    const session = await getSession()
    const layout = cookies().get("react-resizable-panels:layout:platform")
    const collapsed = cookies().get("react-resizable-panels:collapsed")

    const defaultLayout = layout ? JSON.parse(layout.value) : undefined
    const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

    const invitees = await prisma?.invitation.findMany({
        where: {
            organizationId: session?.user.organizationId
        }
    })

    const members = await prisma?.member.findMany({
        include: {
            user: true
        },
        where: {
            organizationId: session?.user.organizationId
        }
    })

    return (
        <main className="flex flex-col items-start w-full h-screen mx-auto p-8">
            <div className="flex flex-col space-y-8 w-full">
                <Tabs defaultValue="organization" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="organization">Organization</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                        <TabsTrigger value="invitations">Invitations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="organization">
                        <OrganizationSettingsTab/>
                    </TabsContent>

                    <TabsContent value="members">
                        <div className="p-8">
                            <div className="sm:flex sm:items-center">
                                <div className="space-y-2 sm:flex-auto">
                                    <h1 className="text-xl font-semibold leading-6 text-gray-900">
                                        Members
                                    </h1>
                                    <p className="text-sm text-gray-700">
                                        All the members of your organization.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8 flow-root">
                                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead>
                                            <tr>
                                                <th scope="col"
                                                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                                    Name
                                                </th>
                                                <th scope="col"
                                                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Status
                                                </th>
                                                <th scope="col"
                                                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Role
                                                </th>
                                                <th scope="col"
                                                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Invited
                                                </th>
                                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                                    <span className="sr-only">Edit</span>
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                            {members?.map((person) => (
                                                <tr key={person.email}>
                                                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                                        <div className="flex items-center">
                                                            <div className="h-11 w-11 flex-shrink-0">
                                                                <img className="h-11 w-11 rounded-full"
                                                                     src={person.user?.image || ""} alt=""/>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div
                                                                    className="font-medium text-gray-900">{person.user?.name}</div>
                                                                <div className="mt-1 text-gray-500">{person.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                                        <span
                                                            className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                                                        >
                                                            Active
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                                        {person.role}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                                        {new Date(person.createdAt).toDateString()}
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                        <a href="#" className="text-black hover:text-black">
                                                            Edit<span className="sr-only">, {person.user?.name}</span>
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="invitations">
                        <div className="p-8">
                            <div className="sm:flex sm:items-center">
                                <div className="space-y-2 sm:flex-auto">
                                    <h1 className="text-xl font-semibold leading-6 text-gray-900">
                                        Invitations
                                    </h1>
                                    <p className="text-sm text-gray-700">
                                        All open invitations sent by your organization.
                                    </p>
                                </div>
                                <InviteUserToOrgDialog/>
                            </div>
                            <div className="mt-8 flow-root">
                                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead>
                                            <tr>
                                                <th scope="col"
                                                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                                    Email
                                                </th>
                                                <th scope="col"
                                                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Role
                                                </th>
                                                <th scope="col"
                                                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Invited
                                                </th>
                                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                                    <span className="sr-only">Edit</span>
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                            {invitees?.map((person) => (
                                                <tr key={person.email}>
                                                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                                        <div className="flex items-center">
                                                            <div className="h-11 w-11 flex-shrink-0">
                                                                <img className="h-11 w-11 rounded-full"
                                                                     src={createDicebearAvatar(person.email, 50, 40, "identicon")} alt=""/>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div
                                                                    className="font-medium text-gray-900">
                                                                    {person.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                                        {person.role}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                                        {new Date(person.createdAt.toDateString()).toDateString()}
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger>
                                                                Edit<span className="sr-only">, {person.email}</span>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem className="text-red-600">
                                                                    <FaUserXmark/>
                                                                    Revoke invite
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    )
}