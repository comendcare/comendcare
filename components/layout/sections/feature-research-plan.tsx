import {CloudUpload, Users} from "lucide-react";
import Image from "next/image";
import researchPlanner from "@/public/screenshots/research-planner.png";
import {motion} from "framer-motion"

const features = [
    {
        name: "Easy imports.",
        description:
            "Create new projects, assets, and RFPs, or effortlessly import them instead.",
        icon: CloudUpload,
    },
    {
        name: "Team workspaces.",
        description:
            "Invite members of your organization or partners to collaborate, as owners or members.",
        icon: Users,
    },
];

export default function FeatureResearchPlan() {
    return (
        <motion.section
            initial={{opacity: 0, y: 50}}
            animate={{opacity: 1, y: [50, -10, 0]}}
            transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
            className="overflow-hidden bg-white py-24 sm:py-32"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div
                    className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    {/* Left-aligned image */}
                    <div className="flex items-start justify-end lg:order-first">
                        <Image
                            src={researchPlanner}
                            quality={100}
                            priority={true}
                            alt="preview image"
                            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
                            width={2432}
                            height={1442}
                        />
                    </div>

                    {/* Text content */}
                    <div className="lg:ml-auto lg:pl-4 lg:pt-4">
                        <div className="lg:max-w-lg">
                            <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                                Build your research plan
                            </p>
                            <p className="mt-6 text-lg/8 text-gray-600">
                                Map out your efforts intuitively, with your team. Showcase your assets and funding
                                opportunities to
                                prospective researchers.
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
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
