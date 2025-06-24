"use client"

import { useState } from "react";
import Image from "next/image";
import GGTeam from "@/public/team/gg-team.jpg";

export default function About() {
    const [showMore, setShowMore] = useState(false);

    return (
        <div className="mt-32 overflow-hidden sm:mt-40">
            <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8 items-start justify-start">
                <div className="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">
                    <h2 className="text-xl font-bold text-neutral-600 dark:text-neutral-300 md:text-3xl">
                        We believe that the rare community will unlock the next generation of medicine
                    </h2>
                    <p className="mt-6 text-base/7 text-gray-600">
                        Who are we, and why are we doing this? We get that question a lot.
                        When Flawnson and Albert founded Comend in 2023, we had a simple motivation: to make translational research — early-stage work with real-world impact — accessible to everyone, not just experts.
                    </p>
                    <p className="mt-6 text-base/7 text-gray-600">
                        Drawing from our experiences in drug discovery and healthcare, we saw firsthand the critical benefits of involving patients and their loved ones directly in the development of new solutions. Frankly, it still surprises us that this isn’t common practice.

                        We firmly believed and still do, that while good science doesn’t come from everywhere, it can come from anywhere.
                    </p>

                    {showMore && (
                        <>
                            <p className="mt-6 text-base/7 text-gray-600">
                                This belief naturally drew us to the rare disease community, where this kind of collaboration isn’t just an ideal — it’s a necessity. Patient groups are the champions for drug development for thousands of overlooked and often life-threatening genetic diseases, many affecting children.

                                Our mission became clear: to build software that empowers these patient groups, hand-in-hand with patient groups.
                            </p>
                            <p className="mt-6 text-base/7 text-gray-600">
                                We’re convinced that forging new treatment options for our loved ones can and should be much easier. That backing those who care the most about these 10,000 diseases affecting over 400 million patients is the most effective way to address these vast unmet medical needs — and will prove that precision medicine can be achieved for countless more people and conditions.

                                Keep scrolling to meet the passionate team behind Comend.
                            </p>
                        </>
                    )}

                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        {showMore ? "Show less" : "Continue reading..."}
                    </button>
                </div>

                <div className="flex flex-wrap items-start justify-start gap-6 sm:gap-8 lg:contents">
                    <div className="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none">
                        <Image
                            src={GGTeam}
                            height="2000"
                            width="2000"
                            className="aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover"
                            alt="Startup template image"
                            fetchPriority="high"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
