"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ResponsiveContainer, PieChart, Pie, Label} from "recharts";
import {cn} from "@/lib/utils";

const formsData = [
    {
        "name": "Submitted",
        "value": 3,
        "fill": "#9D82CA"
    },
    {
        "name": "In progress",
        "value": 7,
        "fill": "#CA9D82"
    },
    {
        "name": "Not started",
        "value": 12,
        "fill": "#82CA9D"
    },
]

export const DonutChartCard = () => {

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    Milestones
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="flex flex-row">
                    {formsData.map((formData, index) =>
                        <span
                            key={index}
                            className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3"
                        >
                            <span
                                style={{ backgroundColor: formData.fill }} // Can't use Tailwind for this
                                className="flex w-2.5 h-2.5 rounded-full me-1.5 flex-shrink-0"
                            />
                                {formData.name}
                        </span>
                    )}
                </div>

                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart width={730} height={250}>
                            {/*<Pie data={data01} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" />*/}
                            <Pie
                                data={formsData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                label
                            >
                                <Label
                                    className="font-semibold"
                                    value={`${formsData.reduce((acc, item) => acc + item.value, 0)} forms`}
                                    position="center"
                                />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
};
