import {ReactElement} from "react";

export default function HowItWorksCard({
                                           icon,
                                           step,
                                           header,
                                           description,
                                           cta,
                                       }: {
    icon: ReactElement<any, any> | string;
    step: number;
    header: string;
    description: string;
    cta: string;
}) {
    return (
        <div className="w-full group relative block h-48 sm:h-56">
            {/* Dashed border around the card */}
            <span className="absolute inset-0 border-2 border-dashed border-black"></span>

            {/* Box Content */}
            <div
                className="relative flex h-full items-end border-2 border-black bg-white transition-transform group-hover:-translate-y-2">
                {/* Step Number (now positioned in the top-left corner) */}
                <div
                    className="absolute top-8 left-8 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-solid border-black bg-white z-10  transition-opacity group-hover:opacity-0">
                    <span className="text-base font-bold leading-7">{step}</span>
                </div>

                {/* Icon and Header */}
                <div className="relative p-4 transition-opacity group-hover:opacity-0 sm:p-6 lg:p-8">
                    <div className="mt-4 inline-flex gap-x-4 items-center">
                        <h2 className="text-xl font-medium sm:text-4xl">{icon}</h2>
                        <h2 className="text-lg font-medium sm:text-xl">{header}</h2>
                    </div>
                </div>

                {/* Description and CTA (visible on hover) */}
                <div className="absolute p-4 opacity-0 transition-opacity group-hover:opacity-100 sm:p-6 lg:p-8">
                    <h3 className="mt-4 text-xl font-medium sm:text-2xl">{header}</h3>
                    <p className="mt-4 text-sm sm:text-base">{description}</p>
                </div>
            </div>
        </div>
    );
}
