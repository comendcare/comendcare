import Image from "next/image"

export function PublicNoPinnedAssets() {
    return (
        <div className="h-full flex items-center justify-center gap-8 flex-col md:flex-row">
            <Image
                alt="No pinned tools"
                src="https://illustrations.popsy.co/gray/studying.svg"
                width={200}
                height={200}
                className="dark:hidden"
            />
            <Image
                alt="No pinned tools"
                src="https://illustrations.popsy.co/gray/studying.svg"
                width={200}
                height={200}
                className="hidden dark:block"
            />
            <div className="flex flex-col justify-center items-center space-y-8">
                <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                    {`This organization does not have any pinned tools.`}
                </p>
            </div>
        </div>
    )
}

export function PrivateNoPinnedAssets() {
    return (
        <div className="h-full flex items-center justify-center gap-8 flex-col md:flex-row">
            <Image
                alt="No pinned tools"
                src="https://illustrations.popsy.co/gray/studying.svg"
                width={200}
                height={200}
                className="dark:hidden"
            />
            <Image
                alt="No pinned tools"
                src="https://illustrations.popsy.co/gray/studying.svg"
                width={200}
                height={200}
                className="hidden dark:block"
            />
            <div className="flex flex-col justify-center items-center space-y-8">
                <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                    {`Your organization does not have any pinned tools.`}
                </p>
            </div>
        </div>
    )
}
