import prisma from "@/lib/prisma"
import Form from "@/components/form"
import { adminUpdateOrganizationAttribute } from "@/lib/actions"
import DeleteOrganizationForm from "@/components/form/delete-organization-form"

export default async function SiteSettingsIndex({
    params
}: {
    params: { id: string }
}) {
    const data = await prisma.organization.findUnique({
        where: {
            id: decodeURIComponent(params.id)
        }
    })

    return (
        <div className="flex flex-col space-y-6">
            <Form
                title="Name"
                description="The name of your organization. This will be used as the meta title on Google as well."
                helpText="Please use 32 characters maximum."
                inputAttrs={{
                    name: "name",
                    type: "text",
                    defaultValue: data?.name!,
                    placeholder: "My Awesome Site",
                    maxLength: 32
                }}
                handleSubmit={adminUpdateOrganizationAttribute}
            />

            <Form
                title="Description"
                description="The description of your organization. This will be used as the meta description on Google as well."
                helpText="Include SEO-optimized keywords that you want to rank for."
                inputAttrs={{
                    name: "description",
                    type: "text",
                    defaultValue: data?.description!,
                    placeholder: "A blog about really interesting things."
                }}
                handleSubmit={adminUpdateOrganizationAttribute}
            />

            <DeleteOrganizationForm organization={data!} />
        </div>
    )
}
