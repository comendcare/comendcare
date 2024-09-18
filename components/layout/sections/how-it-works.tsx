import React from "react";

const HowItWorks = () => {
    return (
        <div className="w-full container mx-auto my-32 max-w-7xl flex flex-col items-start gap-16">
            <div className="flex flex-col gap-16">
                <div className="flex flex-col gap-2 text-start">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        How Raresearch works
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        We're the end to end solution for patient groups to accelerate new research.
                    </p>
                </div>
            </div>
            <div
                className="grid grid-cols-3 gap-y-10 lg:gap-x-8 lg:gap-y-0 xl:gap-x-10"
            >
                <div className="flex items-start gap-4">
                    <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500 transition hover:bg-blue-600 focus:bg-blue-700"
                    >
                        <span className="text-base font-bold leading-7 text-white">1</span>
                    </div>
                    <div className="flex flex-col">
                        <h3
                            className="mb-2 text-base font-bold leading-tight text-dark-grey-900"
                        >
                            Add your patient group
                        </h3>
                        <p className="text-base font-medium leading-7 text-dark-grey-600">
                            Detail your organization's team, the number of patients you have, your research
                            roadmap, and your ongoing projects.
                        </p>
                    </div>
                    <div className="rotate-90 lg:rotate-0">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="43"
                            height="42"
                            viewBox="0 0 43 42"
                            fill="none"
                        >
                            <g>
                                <path
                                    d="M16.9242 11.7425C16.2417 12.425 16.2417 13.5275 16.9242 14.21L23.7142 21L16.9242 27.79C16.2417 28.4725 16.2417 29.575 16.9242 30.2575C17.6067 30.94 18.7092 30.94 19.3917 30.2575L27.4242 22.225C28.1067 21.5425 28.1067 20.44 27.4242 19.7575L19.3917 11.725C18.7267 11.06 17.6067 11.06 16.9242 11.7425Z"
                                    fill="#68769F"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_3346_6663">
                                    <rect
                                        width="42"
                                        height="42"
                                        fill="white"
                                        transform="translate(0.666748)"
                                    />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-solid border-blue-500 bg-transparent text-blue-500"
                    >
                        <span className="text-base font-bold leading-7">2</span>
                    </div>
                    <div className="flex flex-col">
                        <h3
                            className="mb-2 text-base font-bold leading-tight text-dark-grey-900"
                        >
                            Match with opportunities
                        </h3>
                        <p className="text-base font-medium leading-7 text-dark-grey-600">
                            We'll find the most relevant researchers and grants for you; or browse thousands of
                            researchers and grants on our platform.
                        </p>
                    </div>
                    <div className="rotate-90 lg:rotate-0">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="43"
                            height="42"
                            viewBox="0 0 43 42"
                            fill="none"
                        >
                            <g clipPath="url(#clip0_3346_6663)">
                                <path
                                    d="M16.9242 11.7425C16.2417 12.425 16.2417 13.5275 16.9242 14.21L23.7142 21L16.9242 27.79C16.2417 28.4725 16.2417 29.575 16.9242 30.2575C17.6067 30.94 18.7092 30.94 19.3917 30.2575L27.4242 22.225C28.1067 21.5425 28.1067 20.44 27.4242 19.7575L19.3917 11.725C18.7267 11.06 17.6067 11.06 16.9242 11.7425Z"
                                    fill="#68769F"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_3346_6663">
                                    <rect
                                        width="42"
                                        height="42"
                                        fill="white"
                                        transform="translate(0.666748)"
                                    />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-solid border-blue-500 bg-transparent text-blue-500"
                    >
                        <span className="text-base font-bold leading-7">3</span>
                    </div>
                    <div className="flex flex-col">
                        <h3
                            className="mb-2 text-base font-bold leading-tight text-dark-grey-900"
                        >
                            Start collaborations
                        </h3>
                        <p className="text-base font-medium leading-7 text-dark-grey-600">
                            Use our research agreement templates to facilitate collaboration, manage IP sharing, and
                            distribute work to contract researchers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
