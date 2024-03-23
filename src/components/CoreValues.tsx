export function CoreValues() {

    const coreValues = [
        {
            heading: "Designed by and for the people",
            description: "We strive to do everything in partnership with the community. We’re active and empathetic listeners who welcome feedback with open arms. Come build with us."
        },
        {
            heading: "Build things that last",
            description: "We move with the urgency needed to disrupt the status quo and accelerate cures but with the self-awareness to avoid breaking things. We aim to create sustainable innovations by building robust products that can last beyond us."
        },
        {
            heading: "Lead with transparency",
            description: "We operate with clear incentives that prioritize the needs of patient families. We make decisions and take actions with full transparency to demonstrate our integrity."
        },
        {
            heading: "Great science can come from you",
            description: "We’re deep believers in the power of citizen science to solve the world's hardest problems. Our model empowers families from any background to create change for their loved ones."
        },
    ]

    return (
        <div
            aria-label="Solutions to help grow patient groups"
            className="flex flex-col items-center mx-auto max-w-7xl px-6 my-48 lg:px-8"
        >
            <div className="flex flex-col items-center max-w-2xl lg:mx-0">
                <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
                    Our values
                </h2>
                <p className="mt-6 text-lg leading-8 text-gray-600 text-center">
                    {`We follow a few guiding principles.`}
                </p>
            </div>
            <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {coreValues.map((coreValue) => (
                    <div key={coreValue.heading}>
                        <dt className="font-semibold text-gray-900">{coreValue.heading}</dt>
                        <dd className="mt-1 text-gray-600">{coreValue.description}</dd>
                    </div>
                ))}
            </dl>
        </div>
    )
}
