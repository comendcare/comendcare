"use client"

import {Lock, Megaphone} from "lucide-react";
import Image from "next/image"
import publicProfile from "@/public/screenshots/public-profile.png"
import fb from "@/public/logos/fb.svg"
import x from "@/public/logos/x.svg"
import insta from "@/public/logos/insta.svg"
import gmail from "@/public/logos/gmail.svg"
import linkedin from "@/public/logos/in.svg"
import whatsapp from "@/public/logos/whatsapp.svg"
import {motion} from "framer-motion"

const features = [
    {
        name: "Attract biopharma.",
        description:
            "Opt-in for us to highlight opportunities in your disease area to industry.",
        icon: Megaphone,
    },
];

export default function FeaturePublicPages() {
    return (
        <motion.section
            initial={{opacity: 0, y: 50}}
            animate={{opacity: 1, y: [50, -10, 0]}}
            transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
            className="overflow-hidden bg-white py-16 sm:py-24"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div
                    className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    <div className="order-1 lg:order-none lg:pr-8 lg:pt-4">
                        <div className="lg:max-w-lg">
                            <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                                Showcase your progress
                            </p>
                            <p className="mt-6 text-lg/8 text-gray-600">
                                Broadcast your projects, assets, and funding opportunities directly to your community,
                                researchers, and drug developers.
                            </p>
                            <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                                {features.map((feature) => (
                                    <div key={feature.name} className="relative pl-9">
                                        <dt className="inline font-semibold text-gray-900">
                                            <feature.icon
                                                aria-hidden="true"
                                                className="absolute left-1 top-1 size-5 text-blue-dark"
                                            />
                                            {feature.name}
                                        </dt>
                                        {" "}
                                        <dd className="inline">{feature.description}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                        {/*<div className="lg:mt-10 mt-20 flex flex-col">*/}
                        {/*    <div className="flex items-center justify-start">*/}
                        {/*        <Image*/}
                        {/*            src={insta}*/}
                        {/*            alt="insta"*/}
                        {/*            width="48"*/}
                        {/*            height="48"*/}
                        {/*            className="rotate-[7deg] mb-[24px]"*/}
                        {/*        />*/}
                        {/*        <Image*/}
                        {/*            src={x}*/}
                        {/*            alt="x"*/}
                        {/*            width="48"*/}
                        {/*            height="48"*/}
                        {/*            className="rotate-[-10deg] ml-[-7px] mb-[24px]"*/}
                        {/*        />*/}
                        {/*        <Image*/}
                        {/*            src={fb}*/}
                        {/*            alt="facebook"*/}
                        {/*            width="48"*/}
                        {/*            height="48"*/}
                        {/*            className="rotate-[12deg] ml-[-7px] mb-[24px]"*/}
                        {/*        />*/}
                        {/*        <Image*/}
                        {/*            src={linkedin}*/}
                        {/*            alt="linkedin"*/}
                        {/*            width="48"*/}
                        {/*            height="48"*/}
                        {/*            className="rotate-[-10deg] ml-[-7px] mb-[24px]"*/}
                        {/*        />*/}
                        {/*        <Image*/}
                        {/*            src={whatsapp}*/}
                        {/*            alt="whatsapp"*/}
                        {/*            width="48"*/}
                        {/*            height="48"*/}
                        {/*            className="rotate-[10deg] ml-[-7px] mb-[24px]"*/}
                        {/*        />*/}
                        {/*        <Image*/}
                        {/*            src={gmail}*/}
                        {/*            alt="gmail"*/}
                        {/*            width="50"*/}
                        {/*            height="50"*/}
                        {/*            className="rotate-[-10deg] ml-[-7px] mb-[24px]"*/}
                        {/*        />*/}
                        {/*    </div>*/}
                        {/*    <p className="text-balance text-base text-neutral-600 dark:text-neutral-300">*/}
                        {/*        {`Easily share on social media`}*/}
                        {/*    </p>*/}
                        {/*</div>*/}
                    </div>
                    <div className="block sm:hidden overflow-x-auto -mx-6 sm:mx-0">
                        <div className="w-[48rem] sm:w-[57rem] md:ml-0">
                            <Image
                                src={publicProfile}
                                quality={100}
                                priority={true}
                                alt="preview image"
                                className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0 px-4"
                                width={2432}
                                height={1442}
                            />
                        </div>
                    </div>
                    <Image
                        src={publicProfile}
                        quality={100}
                        priority={true}
                        alt="preview image"
                        className="hidden sm:block w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                        width={2432}
                        height={1442}
                    />
                </div>
            </div>
        </motion.section>
    );
}
