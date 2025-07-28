import { Separator } from "@/packages/components/ui/separator"

type Stat = {
    name: string
    value: string
    unit?: string
}


export default function RequestStats({stats}: {stats: Stat[]}) {
    return (
        <div className="mx-auto max-w-7xl w-full">
            <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat: Stat, index: number) => (
                    <div className="flex gap-0">
                    <div className="block sm:hidden">
                        {index > 0 && <Separator orientation="vertical" />}
                    </div>

                    <div className="hidden sm:block lg:hidden">
                        {index % 2 !== 0 && <Separator orientation="vertical" />}
                    </div>

                    <div className="hidden lg:block">
                        {index % 4 !== 0 && <Separator orientation="vertical" />}
                    </div>
                    <div key={stat.name} className="px-4 py-6 sm:px-6 lg:px-8">
                        <p className="text-sm/6 font-medium text-gray-600">{stat.name}</p>
                        <p className="mt-2 flex items-baseline gap-x-2">
                            <span className="text-4xl font-semibold tracking-tight text-gray-900">{stat.value}</span>
                            {stat.unit ? <span className="text-sm text-gray-600">{stat.unit}</span> : null}
                        </p>
                    </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
