import Image from "next/image"

export function NoRFPs({isPrivate}: {isPrivate: boolean}) {
    return (
        <div className="h-full flex items-center justify-center gap-8 flex-col md:flex-row">
            <Image
                alt="No RFPs"
                src="https://illustrations.popsy.co/gray/shaking-hands.svg"
                width={200}
                height={200}
                className="dark:hidden"
            />
            <Image
                alt="No RFPs"
                src="https://illustrations.popsy.co/gray/shaking-hands.svg"
                width={200}
                height={200}
                className="hidden dark:block"
            />
            <div className="flex flex-col justify-center items-center space-y-8">
                <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                    {`${isPrivate ? 'Your' : 'This'} organization does not have any public RFPs.`}
                </p>
            </div>
        </div>
    )
}
