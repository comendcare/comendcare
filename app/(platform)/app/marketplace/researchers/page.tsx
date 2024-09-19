"use client"
import {cn} from "@/lib/utils";
import React from "react"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart";
import {Label, Pie, PieChart} from "recharts";
import {TrendingUp} from "lucide-react";
import InputDropdown from "@/components/ui/input-dropdown";

const chartData = [
    {category: "personnel", amount: 50000, fill: "var(--color-personnel)"},
    {category: "equipment", amount: 30000, fill: "var(--color-equipment)"},
    {category: "materials", amount: 20000, fill: "var(--color-materials)"},
    {category: "travel", amount: 10000, fill: "var(--color-travel)"},
    {category: "miscellaneous", amount: 5000, fill: "var(--color-miscellaneous)"},
];

const chartConfig = {
    equipment: {
        label: "Equipment",
        color: "hsl(var(--chart-1))",
    },
    materials: {
        label: "Materials",
        color: "hsl(var(--chart-2))",
    },
    travel: {
        label: "travel",
        color: "hsl(var(--chart-3))",
    },
    personnel: {
        label: "Personnel",
        color: "hsl(var(--chart-4))",
    },
    miscellaneous: {
        label: "Miscellaneous",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig

export default function BudgetPage({params}: { params: { projectId: string } }) {
    const totalAmount = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.amount, 0);
    }, [])

    return (
        <main className="flex flex-col items-center w-full h-screen mx-auto">
            <div className="max-w-7xl flex flex-col w-full p-4 mt-72">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <InputDropdown/>
                        <h2 className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                            Budget
                        </h2>
                        <p className="whitespace-pre-wrap">
                            {`The budget for our rare disease research project has been meticulously planned to ensure every aspect of the study is well-supported and can proceed smoothly. The largest portion of our budget, amounting to $50,000, is allocated to Personnel. This includes salaries for the dedicated researchers, lab technicians, and support staff who are essential for conducting the study. Their expertise and commitment are crucial for the project's success, from recruiting participants to analyzing data.

Next, we have set aside $30,000 for Equipment. Research of this nature requires advanced technology and specialized tools to collect and analyze genetic data accurately. This investment ensures we have the latest and most reliable equipment at our disposal, enhancing the quality and precision of our research.

Materials, including lab reagents, consumables, and other essential supplies, account for $20,000 of our budget. These materials are necessary for day-to-day lab work and experiments. Without them, we wouldn't be able to conduct the tests and analyses needed to uncover new insights into the rare disease we are studying.

We have also allocated $10,000 for Travel. This covers the costs of attending conferences, workshops, and collaborative meetings with other researchers and medical professionals. These events are invaluable for sharing our findings, gaining new perspectives, and building partnerships that can further our research goals.

Lastly, $5,000 is reserved for Miscellaneous expenses. This category covers any unforeseen costs that may arise during the project, such as minor equipment repairs, additional software licenses, or other unexpected needs. Having a buffer for these miscellaneous expenses ensures that our research can continue uninterrupted, even when unexpected challenges arise.

In summary, our budget is carefully balanced to cover all critical areas of the research project, ensuring we have the resources and flexibility needed to achieve our goals and make significant advancements in understanding and treating the rare disease.`}
                        </p>
                    </div>
                    <Card className="flex flex-col border-none shadow-none">
                        <CardHeader className="items-center pb-0">
                            <CardTitle>Budget Breakdown</CardTitle>
                            <CardDescription>January - June 2024</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 pb-0">
                            <ChartContainer
                                config={chartConfig}
                                className="mx-auto aspect-square max-h-[400px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
                            >
                                <PieChart>
                                    <ChartTooltip content={<ChartTooltipContent hideLabel className="w-40"/>} />
                                    <Pie
                                        data={chartData}
                                        dataKey="amount"
                                        label
                                        nameKey="category"
                                        innerRadius={100}
                                        strokeWidth={5}
                                    >
                                        <Label
                                            content={({ viewBox }) => {
                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                    return (
                                                        <text
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                        >
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                className="fill-foreground text-3xl font-bold"
                                                            >
                                                                {totalAmount.toLocaleString()}
                                                            </tspan>
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={(viewBox.cy || 0) + 24}
                                                                className="fill-muted-foreground"
                                                            >
                                                                USD
                                                            </tspan>
                                                        </text>
                                                    );
                                                }
                                            }}
                                        />
                                    </Pie>
                                    <ChartLegend
                                        content={<ChartLegendContent nameKey="category" />}
                                        className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                                    />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                        {/*<CardFooter className="flex-col gap-2 text-sm">*/}
                        {/*<div className="flex items-center gap-2 font-medium leading-none">*/}
                        {/*    Trending up by 5.2% this month <TrendingUp className="h-4 w-4"/>*/}
                        {/*</div>*/}
                        {/*<div className="leading-none text-muted-foreground">*/}
                        {/*    Showing total visitors for the last 6 months*/}
                        {/*</div>*/}
                        {/*</CardFooter>*/}
                    </Card>
                </div>
            </div>
        </main>
    )
}
