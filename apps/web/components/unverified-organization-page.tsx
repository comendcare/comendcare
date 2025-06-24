import Image from "next/image"
import {Organization} from "@prisma/client";


export default function UnverifiedOrganizationPage({organization}: {organization: Partial<Organization>}) {
    return (
        <div className="h-full flex flex-col mx-auto items-center justify-center py-20">
            <Image
                alt="Organization not verified"
                src="https://illustrations.popsy.co/gray/abstract-art-6.svg"
                width={400}
                height={400}
                className="dark:hidden"
            />
            <Image
                alt="Organization not verified"
                src="https://illustrations.popsy.co/white/abstract-art-6.svg"
                width={400}
                height={400}
                className="hidden dark:block"
            />
            <p className="text-center font-title text-2xl text-stone-600 dark:text-stone-400">
                {`Your organization is not verified yet.`}
            </p>
            <p className="text-center mt-4 text-stone-500 dark:text-stone-300">
                {`We're currently verifying ${organization.name}. If this is taking too long, please get in touch with us.`}
            </p>
        </div>
    )
}
