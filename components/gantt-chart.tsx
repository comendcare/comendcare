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
// import Socials from "@/components/socials";
// import { ganttChartDataGenerator } from "@/lib/utils";

  const chartConfig: ChartConfig = {
    item: {
      label: "Item",
      color: "hsl(var(--chart-3))",
    },
  };
  
  type DataPoint = {
    x: number | undefined;
    z: number | undefined;
    y: number;
    id: number;
    item: string;
  };

const selector = (state: RoadmapState) => ({
    milestones: state.milestones,
    setSelectedNodeId: state.setSelectedNodeId,
    setTask: state.setTask,
    setTasks: state.setTasks
})

export function GanttChartView() {
    const { milestones } = useRoadmapStore(useShallow(selector))

    return (
        <GanttChart initMilestones={milestones}/>
    )
}

function GanttChart({ initMilestones }: { initMilestones: any[] }) {
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
      }));

      setChartData(parsedData);
    }, []);
  
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
            className="aspect-auto h-full"
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
                    data={chartData.map(dataPoint => (
                      {
                        ...dataPoint,
                        ...(dataPoint.x === undefined ? { x: xDomain[0] } : undefined),
                        ...(dataPoint.z === undefined ? { z: xDomain[1] } : undefined)
                      }
                    ))}
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
      const charWidth = 5;
      const maxChars = Math.floor(maxWidth / charWidth);
      if (text.length > maxChars) {
        return text.slice(0, maxChars - 3) + "...";
      }
      return text;
    };
  
    const truncatedText = truncateText(payload.item, barWidth);

    const handleEditClick = (nodeId: string) => {
        setSelectedNodeId(nodeId)

        const params = new URLSearchParams(searchParams.toString())
        params.delete("milestone")
        params.set("milestone", nodeId)

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }
  
    return (
        <g>
            <foreignObject x={cx} y={cy - barHeight / 2} width={barWidth} height={40}>
            <Button className="h-full w-full" onClick={() => { handleEditClick(payload.itemNodeId) }}>
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
        <div className="p-2 border bg-secondary rounded shadow">
          <p className="font-bold">{data.item}</p>
          <p>Start: {new Date(data.x).toLocaleDateString()}</p>
          <p>End: {new Date(data.z).toLocaleDateString()}</p>
        </div>
      );
    }
    return null;
  };

  const ganttChartDataGenerator = (milestones: any[], n: number, durationInDays: number) => {
    const data: any[] = [];
    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + durationInDays * 24 * 60 * 60 * 1000
    );
  
    const getRandomDate = (start: Date, end: Date) => {
      return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
    };
  
    const getRandomDuration = (minDays: number, maxDays: number) => {
      return Math.floor(Math.random() * (maxDays - minDays + 1) + minDays);
    };
  
    // Generate tasks
    milestones.forEach((milestone, index) => {
        data.push({
            id: index + 1,
            item: milestone.title,
            itemNodeId: milestone.nodeId,
            start_date: milestone.startDate?.toISOString(),
            end_date: milestone.endDate?.toISOString()
        });
    })
    // for (let i = 0; i < n; i++) {
    //   const taskDuration = getRandomDuration(
    //     1,
    //     Math.max(2, Math.floor(durationInDays / 10))
    //   ); // Ensure some short tasks
    //   let start = getRandomDate(
    //     startDate,
    //     new Date(endDate.getTime() - taskDuration * 24 * 60 * 60 * 1000)
    //   );
    //   let end = new Date(start.getTime() + taskDuration * 24 * 60 * 60 * 1000);
  
    //   // Ensure some tasks overlap
    //   if (i > 0 && Math.random() < 0.4) {
    //     const prevTask = data[data.length - 1];
    //     start = getRandomDate(
    //       new Date(prevTask.start_date),
    //       new Date(prevTask.end_date)
    //     );
    //     end = new Date(start.getTime() + taskDuration * 24 * 60 * 60 * 1000);
  
    //     // Adjust end date if it exceeds the project end date
    //     if (end > endDate) {
    //       end = endDate;
    //     }
    //   }
  
    //   data.push({
    //     id: i + 1,
    //     item: `Task ${i + 1}`,
    //     start_date: start.toISOString(),
    //     end_date: end.toISOString(),
    //   });
    // }
  
    // sort
    // data.sort((a, b) => new Date(a.start_date).valueOf() - new Date(b.start_date).valueOf());
  
    return data;
  };
