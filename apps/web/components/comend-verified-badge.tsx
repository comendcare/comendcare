import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import Link from "next/link";


export default function ComendVerifiedBadge({verified}: {verified: boolean}) {
    return (
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
                {verified ?
                    <span
                        className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-emerald-900 h-fit w-fit"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            className="-ms-1 me-1.5 size-4"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>

                        <p className="whitespace-nowrap text-sm">
                            Verified
                        </p>
                    </span>
                    :
                    <span
                        className="inline-flex items-center justify-center rounded-full bg-red-100 px-2.5 py-0.5 text-red-700"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            className="-ms-1 me-1.5 size-4"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                            />
                        </svg>

                        <p className="whitespace-nowrap text-sm">
                            Unverified
                        </p>
                    </span>
                }
            </HoverCardTrigger>
            <HoverCardContent
                side="top"
                className="w-fit max-w-80 text-base font-normal break-words whitespace-normal"
            >
                <p>
                    {`Your organization is pending verification by someone on the Comend team.`}
                </p>
                <Link href="#" className="underline text-blue-600 hover:text-blue-800">
                    {`What does this mean?`}
                </Link>
            </HoverCardContent>
        </HoverCard>

    )
}