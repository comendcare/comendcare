"use client";

import React, {
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Scatter,
  ScatterChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { Task } from "./task-card";
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import StatusButton from "./milestone-status-button";
import { truncate } from "@/lib/utils";
import { DateView } from "./miletone-date-view";
// import Socials from "@/components/socials";
// import { ganttChartDataGenerator } from "@/lib/utils";

  const chartConfig: ChartConfig = {
    item: {
      label: "Item",
      color: "hsl(var(--chart-3))",
    },
  };
  
  type DataPoint = {
    x: number | undefined
    z: number | undefined
    y: number
    id: number
    item: string
    milestoneData: any
  };

const selector = (state: RoadmapState) => ({
    milestones: state.milestones,
    setSelectedNodeId: state.setSelectedNodeId,
    setTask: state.setTask,
    setTasks: state.setTasks
})

export function GanttChartView() {
    const [chartData, setChartData] = useState<DataPoint[]>([]);
    const { milestones } = useRoadmapStore(useShallow(selector))

    useEffect(() => {
      const data = ganttChartDataGenerator(milestones, 20, 60);
      const parsedData = data.map((d, i) => ({
        x: d.start_date ? new Date(d.start_date).valueOf() : undefined,
        z: d.end_date ? new Date(d.end_date).valueOf() : undefined,
        y: i,
        id: d.id,
        item: d.item,
        milestoneData: d.milestoneData
      }));

      setChartData(parsedData);
    }, [milestones]);
  
    const xDomain = useMemo(() => {
      const now = new Date()
      let filteredXData = chartData.map(d => d.x).filter(d => d !== undefined)
      let filteredZData = chartData.map(d => d.z).filter(d => d !== undefined)
      if (filteredXData.length <= 0) filteredXData = [now.valueOf() - 100000000]
      if (filteredZData.length <= 0) filteredZData = [now.valueOf() + 100000000]
      const min = Math.min(...filteredXData);
      const max = Math.max(...filteredZData);
      return [min - 1000 * 60 * 60 * 24, max + 1000 * 60 * 60 * 24];
    }, [chartData]);
  
    const yDomain = useMemo(() => [0, chartData.length - 1], [chartData]);
    const generateTicks = () => {
      const now = new Date()
      let filteredXData = chartData.map(d => d.x).filter(d => d !== undefined)
      let filteredZData = chartData.map(d => d.z).filter(d => d !== undefined)
      if (filteredXData.length <= 0) filteredXData = [now.valueOf() - 100000000]
      if (filteredZData.length <= 0) filteredZData = [now.valueOf() + 100000000]
      const minDate = Math.min(...filteredXData);
      const maxDate = Math.max(...filteredZData);
      const ticks = [];
      let currentTick = new Date(minDate);
      currentTick.setHours(0, 0, 0, 0);
  
      while (currentTick.valueOf() <= maxDate) {
        ticks.push(currentTick.valueOf())
        currentTick.setMonth(currentTick.getMonth() + 1)
      }
  
      return ticks;
    };
  
    const formatXAxis = (tickItem: number) => {
      const date = new Date(tickItem);
      return `${date.getMonth() + 1}/${date.getFullYear()}`;
    };
  
    return (
      <ScrollArea className="h-full w-full">
        <ChartContainer
            config={chartConfig}
            className="aspect-auto h-full max-h-[500px]"
        >
            <ScatterChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    type="number"
                    dataKey="x"
                    domain={xDomain}
                    ticks={generateTicks()}
                    tickFormatter={formatXAxis}
                    padding={{ left: 30, right: 30 }}
                    style={{ userSelect: "none" }}
                />
                <YAxis
                    hide
                    type="number"
                    dataKey="y"
                    name="weight"
                    domain={yDomain}
                    padding={{ top: 50, bottom: 50 }}
                    style={{ userSelect: "none" }}
                />
                <ChartTooltip
                    content={<CustomTooltip />}
                    cursor={{ strokeDasharray: "3 3", opacity: 0.3 }}
                    wrapperStyle={{ zIndex: 100 }}
                />
                <Scatter
                    data={chartData.map((dataPoint): {
                      x: number
                      z: number
                      y: number
                      id: number
                      item: string
                      milestoneData: any
                    } => (
                      {
                        x: dataPoint.x || xDomain[0],
                        z: dataPoint.z || xDomain[1],
                        y: dataPoint.y,
                        id: dataPoint.id,
                        item: dataPoint.item,
                        milestoneData: dataPoint.milestoneData
                      }
                    )).sort((a, b) => new Date(a.x).valueOf() - new Date(b.x).valueOf())}
                    fill="hsl(var(--chart-1))"
                    shape={<CustomBar/>}
                ></Scatter>
            </ScatterChart>
        </ChartContainer>
      </ScrollArea>
    );
}

const CustomBar = (props: any) => {
    const { cx, cy, fill, payload, xAxis } = props;
    const barWidth = xAxis.scale(payload.z) - xAxis.scale(payload.x);
    const barHeight = 40;
    const {
        setSelectedNodeId,
    } = useRoadmapStore(useShallow(selector))
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
  
    const truncateText = (text: string, maxWidth: number) => {
      const charWidth = 7;
      const maxChars = Math.floor(maxWidth / charWidth);
      if (text.length > maxChars) {
        return text.slice(0, maxChars - 3) + "...";
      }
      return text;
    };
  
    const truncatedText = truncateText(payload.item, barWidth);

    const handleEditClick = (payload: DataPoint) => {
      const nodeId = payload.milestoneData.nodeId
      setSelectedNodeId(nodeId)

      const params = new URLSearchParams(searchParams.toString())
      params.delete("milestone")
      params.set("milestone", nodeId)

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }
  
    return (
        <g>
            <foreignObject x={cx} y={cy - barHeight / 2} width={barWidth} height={40}>
            <Button className="h-full w-full" onClick={() => { handleEditClick(payload) }}>
                {truncatedText}
            </Button>
            </foreignObject>
        </g>
    );
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>{data?.milestoneData?.title || "New Milestone"}</CardTitle>
                {/* Description length in node is truncated to 200 characters. */}
                <CardDescription>
                    {truncate(data?.milestoneData?.description || "", 200)}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
                {(data?.milestoneData?.startDate?.getMonth() || data?.milestoneData?.endDate?.getFullYear()) && (
                    <DateView startDate={data?.milestoneData?.startDate} endDate={data?.milestoneData?.endDate}/>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <StatusButton
                    disabled={true}
                    status={data?.milestoneData?.status || "TODO"}
                    onStatusChange={() => {}}
                />
            </CardFooter>
        </Card>
      );
    }
    return null;
  };

  const ganttChartDataGenerator = (milestones: any[], n: number, durationInDays: number) => {
    const data: any[] = [];
  
    // Generate tasks
    milestones.forEach((milestone, index) => {
        data.push({
            id: index + 1,
            item: milestone.title,
            start_date: milestone.startDate?.toISOString(),
            end_date: milestone.endDate?.toISOString(),
            milestoneData: milestone
        });
    })
  
    return data;
  };
