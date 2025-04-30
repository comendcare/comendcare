import Image from "next/image"

export default function NoResearchPlans() {
    return (
        <div className="h-full flex items-center justify-center gap-8">
            <Image
                alt="No research plans"
                src="https://illustrations.popsy.co/gray/studying.svg"
                width={200}
                height={200}
                className="dark:hidden"
            />
            <Image
                alt="No research plans"
                src="https://illustrations.popsy.co/gray/studying.svg"
                width={200}
                height={200}
                className="hidden dark:block"
            />
            <div className="flex flex-col justify-center items-center space-y-8">
                <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                    {`No Research Plans!`}
                </p>
            </div>
        </div>
    )
}
