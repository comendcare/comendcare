import Image from "next/image"
import {Organization} from "@prisma/client";


export default function UnpublishedOrganizationPage({organization}: {organization: Organization}) {
    return (
        <div className="h-full flex flex-col mx-auto items-center justify-center py-20">
            <Image
                alt="Organization not published"
                src="https://illustrations.popsy.co/gray/meditation-girl.svg"
                width={400}
                height={400}
                className="dark:hidden"
            />
            <Image
                alt="Organization not published"
                src="https://illustrations.popsy.co/white/meditation-girl.svg"
                width={400}
                height={400}
                className="hidden dark:block"
            />
            <p className="text-center font-title text-2xl text-stone-600 dark:text-stone-400">
                {`This organization is not published.`}
            </p>
            <p className="text-center mt-4 text-stone-500 dark:text-stone-300 max-w-xl">
                {`${organization.name} has not published their organization's profile page yet. If you believe this is a mistake, please get in touch with us.`}
            </p>
            <p className="text-center mt-4 text-stone-500 dark:text-stone-300 max-w-xl">
                {`If you are a member of this organization, you can publish your organization in your organization's profile page.`}
            </p>
        </div>
    )
}
