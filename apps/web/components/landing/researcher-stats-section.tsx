import {NumberTicker} from "@/packages/components/ui/number-ticker";

export default function ResearcherStatsSection() {
    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                        <dt className="text-base/7 text-gray-600">
                            Curated biospecimens and datasamples
                        </dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                            <NumberTicker value={1000}/>+
                        </dd>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                        <dt className="text-base/7 text-gray-600">
                            Patient groups
                        </dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                            <NumberTicker value={27}/>+
                        </dd>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                        <dt className="text-base/7 text-gray-600">
                            Days average turnover for sample requests
                        </dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                            <span className="inline">&lt;</span><NumberTicker value={7}/>
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    )
}
