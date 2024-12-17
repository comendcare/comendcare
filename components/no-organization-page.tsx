import Image from "next/image"
import Link from "next/link";
import {cn} from "@/lib/utils";
import {buttonVariants} from "@/components/ui/button";
import {FaPlus} from "react-icons/fa6";


export default function NoOrganizationPage() {
    return (
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
            <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                {`You're not part of an organization yet.`}
            </p>
            <Link
                href="/onboarding/organization"
                className={cn(buttonVariants({variant: "default"}), "gap-x-2 mt-8")}
            >
                <FaPlus/>
                Join an organization
            </Link>
        </div>
    )
}
