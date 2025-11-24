"use client"
import {Bookmark, Star} from "lucide-react";
import Image from "next/image";
import marketplace from "@/public/screenshots/marketplace.png"
import {motion} from "framer-motion"
import {NumberTicker} from "@comend/components/ui/number-ticker";
import {cn} from "@comend/lib/utils";
import {useRouter} from "next/navigation";

const features = [
    {
        name: "Submit requests.",
        description:
            "Fill in details about your open projects to share them directly with potential partners.",
        icon: Bookmark,
    },
    {
        name: "Reviews.",
        description:
            "Share about your experiences or hear from other groups.",
        icon: Star,
    },
];

export default function FeatureResearchMarketplace() {
    const router = useRouter()

    return (
        <motion.section
            initial={{opacity: 0, y: 50}}
            animate={{opacity: 1, y: [50, -10, 0]}}
            transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
            className="overflow-hidden bg-white py-16"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div
                    className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    {/* Left-aligned image */}
                    <div className="flex items-start justify-end lg:order-first">
                        <div className="block sm:hidden overflow-x-auto -mx-6 sm:mx-0">
                            <div className="w-[48rem] sm:w-[57rem] md:ml-0">
                                <Image
                                    src={marketplace}
                                    quality={100}
                                    priority={true}
                                    alt="preview image"
                                    className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] px-4"
                                    width={2432}
                                    height={1442}
                                />
                            </div>
                        </div>
                        <Image
                            src={marketplace}
                            quality={100}
                            priority={true}
                            alt="preview image"
                            className="hidden sm:block w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
                            width={2432}
                            height={1442}
                        />
                    </div>

                    {/* Text content */}
                    <div className="lg:ml-auto lg:pl-4 lg:pt-4 space-y-16">
                        <div className="lg:max-w-lg">
                            <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                                Discover partners
                            </p>
                            <p className="mt-6 text-lg/8 text-gray-600">
                                Find complementary patient groups and service providers in our marketplace based on your
                                research plan.
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

                        <motion.div
                            initial={{y: 20, opacity: 0, filter: "blur(4px)"}}
                            animate={{y: 0, opacity: 1, filter: "blur(0px)"}}
                            transition={{duration: 0.5, delay: 4 * 0.1}}
                            className={cn("group/card relative overflow-hidden rounded-lg")}
                        >
                            <div className="flex items-center gap-2">
                                <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                                    <NumberTicker value={2000}/>
                                </p>
                            </div>
                            <p className="mt-4 text-balance text-base text-neutral-600 dark:text-neutral-300">
                                {`Service providers and counting`}
                            </p>
                        </motion.div>
                        {/* <PulsatingButton
                            className="w-fit"
                            onClick={() => router.push("/marketplace")}
                        >
                            View public marketplace
                        </PulsatingButton> */}
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
