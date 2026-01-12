import Image from "next/image"

export function NoResultsTemplate({
    imgAlt,
    src,
    title,
    description
}: {
    imgAlt: string,
    src: string,
    title?: string,
    description?: string
}) {
    return (
        <div className="p-6 max-w-4xl flex items-center justify-center gap-8 flex-col md:flex-row">
            <Image
                alt={imgAlt}
                src={src}
                width={200}
                height={200}
                className="dark:hidden"
            />
            <Image
                alt={imgAlt}
                src={src}
                width={200}
                height={200}
                className="hidden dark:block"
            />
            <div className="flex flex-col space-y-4">
                {title && (
                    <h1 className="font-title text-2xl">{title}</h1>
                )}
                {description && (
                    <p className="font-title text-lg text-stone-600 dark:text-stone-400">{description}</p>
                )}
            </div>
        </div>
    )
}
