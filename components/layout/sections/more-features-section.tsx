"use client"
import React from "react"
import {motion} from "framer-motion"
import {FaCircleCheck} from "react-icons/fa6";


const features = [
    "Multi-tenancy and member controls",
    "Analytics and data insights",
    "Task board and project management",
    "Research plan and milestone templates",
    "Sharable research plans",
    "Privacy controls",
]

export default function MoreFeaturesSection() {
    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: [50, -10, 0] }}
            transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
            id="features"
            className="w-full container mx-auto max-w-7xl px-8 py-24 sm:py-24 space-y-8"
            aria-labelledby="features-heading"
        >
            <div className="flex flex-col justify-center items-center md:w-1/2 mx-auto text-center">
                <div>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                        Powerful features to accelerate research
                    </h3>
                </div>
            </div>

            {/* Features Grid */}
            <div className="hidden md:grid grid-cols-2 gap-4">
                {features.map((feature) => (
                    <div
                        key={feature}
                        className="flex items-center space-x-4 ml-36" // Not going to bother figuring out how to properly center this :|
                    >
                        <FaCircleCheck
                            className="w-8 h-8 text-[#87EBA4] dark:text-[#87EBA4] rounded-full bg-green-600 flex-shrink-0"
                        />
                        <p className="text-2xl">
                            {feature}
                        </p>
                    </div>
                ))}
            </div>

            {/* Mobile-friendly list */}
            <div className="block md:hidden space-y-4">
                {features.map((feature) => (
                    <div key={feature} className="flex items-center space-x-4">
                        <svg
                            className="w-8 h-8 text-[#87EBA4] dark:text-[#87EBA4] flex-shrink-0"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
                            />
                        </svg>
                        <p className="text-lg">
                            {feature}
                        </p>
                    </div>
                ))}
            </div>
        </motion.section>
    )
}