import Link from "next/link"

export default function Questions() {
    return (
        <div className="flex flex-col gap-6 md:flex-row justify-around">
            <div className="flex flex-col items-center self-center">
                {/* <Image
                    className="h-50 w-auto"
                    src={QuestionsGraphic}
                    alt="Questions Graphic"
                /> */}
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Questions?</h2>
            </div>
            <div className="flex flex-col">
                <Link
                    className="p-1.5 flex flex-row items-center p-4 hover:bg-accent hover:text-accent-foreground"
                    href="mailto:hello@librarey.com"
                    type="button"
                >
                    <p>📬</p>
                    <div className="px-4 sm:px-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">{`Email Us`}</h3>
                        <p className="mt-1 text-sm text-gray-500">{`hello@librarey.com`}</p>
                    </div>
                </Link>
                {/* Temporarily removed, this can be set up when we have the Librarey slack community set up. */}
                {/* <Link
                    className="m-1.5 p-1.5 flex flex-row items-center p-4 hover:bg-accent hover:text-accent-foreground"
                    href=""
                    type="button"
                >
                        <p>👋</p>
                        <div className="px-4 sm:px-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                                {`Join Our Community`}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {`Find any answer`}
                            </p>
                        </div>
                </Link> */}
            </div>
        </div>
    )
}
