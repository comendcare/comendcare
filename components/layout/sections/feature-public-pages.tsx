import {Lock, Megaphone} from "lucide-react";
import Image from "next/image"
import publicProfile from "@/public/screenshots/public-profile.png"

const features = [
    {
        name: "Privacy controls.",
        description:
            "Publish or unpublish your organization and tune your research plan projects to be public or private.",
        icon: Lock,
    },
    {
        name: "Get in touch.",
        description:
            "Found a patient group you like? Get in touch directly from their public page.",
        icon: Megaphone,
    },
];

export default function FeaturePublicPages() {
    return (
        <div className="overflow-hidden bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    <div className="lg:pr-8 lg:pt-4">
                        <div className="lg:max-w-lg">
                            <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                                Share your progress
                            </p>
                            <p className="mt-6 text-lg/8 text-gray-600">
                                Easily keep your profile up-to-date and share it with your community, donors, biopharma, and more.
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
                                        </dt>{" "}
                                        <dd className="inline">{feature.description}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                    <Image
                        src={publicProfile}
                        quality={100}
                        priority={true}
                        alt="preview image"
                        className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                        width={2432}
                        height={1442}
                    />
                </div>
            </div>
        </div>
    );
}
