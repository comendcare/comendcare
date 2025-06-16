import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Roadmaps from "@/components/roadmaps"
import CreateRoadmapButton from "@/components/create-roadmap-button"
import {VerifyOrganizationSwitch} from "@/components/verify-organization-switch";
import OrganizationRoadmaps from "@/components/organization-roadmaps";
import {deleteOrganization} from "@/lib/actions";
import mixpanel from "mixpanel-browser";
import {toast} from "sonner";
import { mixpanelTrack } from "@/mixpanel"
import {DeleteOrganizationAlertDialog} from "@/components/delete-organization-alert-dialog";
import EditPAGProfileDialog from "@/components/edit-pag-profile-dialog";

export default async function AdminOrganizationPage({
    params
}: {
    params: { id: string }
}) {
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }
    const data = await prisma.organization.findUnique({
        where: {
            id: decodeURIComponent(params.id)
        }
    })

    if (!data) {
        notFound()
    }

    const url = `${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`

    const handleDeleteOrganization = async () => {

        try {
            await deleteOrganization(data.id, data)
                .then(async res => {
                    if (res.success) {
                        mixpanelTrack("Organization Deleted", {
                            "ID": res?.data?.id,
                            "Name": res?.data?.name,
                        })
                        toast.success(`Successfully deleted organization!`)
                    } else {
                        toast.error(res.error)
                    }
                })
                .catch((err: Error) => toast.error(err.message))
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        }
    };

    return (
        <>
            <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
                <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <h1 className="w-60 truncate font-cal text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
                        All Roadmaps for {data.name}
                    </h1>
                    <a
                        href={
                            process.env.NEXT_PUBLIC_VERCEL_ENV
                                ? `https://${url}`
                                : `http://${data.subdomain}.localhost:3000`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                    >
                        {url} ↗
                    </a>
                    <VerifyOrganizationSwitch organization={data}/>
                </div>
                {/* <CreateRoadmapButton /> */}
                <EditPAGProfileDialog organization={data} />

                <DeleteOrganizationAlertDialog organization={data} />

            </div>
            <OrganizationRoadmaps organizationId={decodeURIComponent(params.id)} />
        </>
    )
}
