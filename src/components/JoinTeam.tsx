import {FaCheckCircle} from "react-icons/fa";
import Link from "next/link"
import FlawnsonAndAlbert from "@/images/profiles/Flawnson and Albert.jpg";

const benefits = [
    'Competitive salaries',
    'Flexible work hours',
    '21 days of paid vacation',
    'Annual team retreats',
    'Equity and ownership',
    'A great work environment',
]


export function JoinTeam() {
    return (
        <div className="relative isolate mt-32 sm:my-48">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div
                    className="mx-auto flex max-w-2xl flex-col gap-16 bg-black/5 px-6 py-16 ring-1 ring-black/10 sm:rounded-3xl sm:p-8 lg:mx-0 lg:max-w-none lg:flex-row lg:items-center lg:py-20 xl:gap-x-20 xl:px-20">
                    <img
                        className="h-96 w-full object-left flex-none rounded-2xl object-cover shadow-xl lg:aspect-square lg:h-auto lg:max-w-sm"
                        src={FlawnsonAndAlbert.src}
                        alt="Flawnson and Albert"
                    />
                    <div className="w-full flex-auto">
                        <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Join our team</h2>
                        <p className="mt-6 text-lg leading-8 text-gray-800">
                            Lorem ipsum dolor sit amet consect adipisicing elit. Possimus magnam voluptatum cupiditate
                            veritatis
                            in accusamus quisquam.
                        </p>
                        <ul
                            role="list"
                            className="mt-10 grid grid-cols-1 gap-x-8 gap-y-3 text-base leading-7 text-black sm:grid-cols-2"
                        >
                            {benefits.map((benefit) => (
                                <li key={benefit} className="flex gap-x-3">
                                    <FaCheckCircle className="h-7 w-5 flex-none text-blue-600" aria-hidden="true"/>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/careers"
                            className="hover:underline mt-10 flex text-base font-semibold leading-6 text-blue-600"
                        >
                            See our job postings &nbsp;<span aria-hidden="true">&rarr;</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}