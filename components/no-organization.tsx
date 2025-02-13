import Image from "next/image"
import CreateOrJoinOrganizationButton from "@/components/create-or-join-organization-button";


export default function NoOrganization() {
    return (
        <main className="flex gap-8 flex-col w-full h-full justify-center items-center mx-auto">
            <div className="h-full flex flex-col items-center justify-center py-20">
                <Image
                    alt="No organization"
                    src="https://illustrations.popsy.co/gray/success.svg"
                    width={400}
                    height={400}
                    className="dark:hidden"
                />
                <Image
                    alt="No organization"
                    src="https://illustrations.popsy.co/white/success.svg"
                    width={400}
                    height={400}
                    className="hidden dark:block"
                />
                <div className="flex flex-col justify-center items-center space-y-8">
                    <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                        {`You're not part of an organization yet.`}
                    </p>
                    <CreateOrJoinOrganizationButton/>
                </div>
            </div>
        </main>
    )
}
