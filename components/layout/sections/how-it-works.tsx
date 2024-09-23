import React from "react";
import HowItWorksCard from "@/components/ui/how-it-works-card";
import {FaCircleArrowRight, FaHandHoldingHeart, FaHandshakeSimple, FaUsers} from "react-icons/fa6";

const steps = [
    {
        id: 1,
        icon: "👨‍👩‍👧",
        title: "Add your patient group",
        description: "Detail your organization's team, the number of patients you have, your research roadmap, and your ongoing projects.",
    },
    {
        id: 2,
        icon: "🤝",
        title: "Match with opportunities",
        description: "We'll find the most relevant researchers and grants for you; or browse thousands of researchers and grants on our platform.",
    },
    {
        id: 3,
        icon: "💡",
        title: "Start collaborations",
        description: "Use our research agreement templates to facilitate collaboration, manage IP sharing, and distribute work to contract researchers.",
    }
];

const HowItWorks = () => {
    return (
        <div className="w-full container mx-auto my-24 max-w-7xl flex flex-col items-start gap-16">
            <div className="flex flex-col gap-16">
                <div className="flex flex-col gap-2 text-start">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        How Comend works
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        We're the end to end solution for patient groups to accelerate new research.
                    </p>
                </div>
            </div>
            <div className="w-full flex flex-row gap-y-10 lg:gap-x-8 lg:gap-y-0 xl:gap-x-10 items-center">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <HowItWorksCard
                            icon={step.icon}
                            step={index + 1}
                            header={step.title}
                            description={step.description}
                            cta={"Read more"}
                        />
                        {/* Conditionally render the caret, but not after the last card */}
                        {index < steps.length - 1 && (
                            <FaCircleArrowRight className="size-36"/>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default HowItWorks;
