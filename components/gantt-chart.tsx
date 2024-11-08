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
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import StatusButton from "./milestone-status-button";
import { truncate } from "@/lib/utils";
import { DateView } from "./miletone-date-view";

  const chartConfig: ChartConfig = {
    item: {
      label: "Item",
      color: "hsl(var(--chart-3))",
    },
  };
  
  type DataPoint = {
    x: number
    z: number
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
  const { milestones, setSelectedNodeId } = useRoadmapStore(useShallow(selector))
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleEditClick = (nodeId: string) => {
    setSelectedNodeId(nodeId)

    const params = new URLSearchParams(searchParams.toString())
    params.delete("milestone")
    params.set("milestone", nodeId)

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-row p-4 h-full">
        <Card className="w-60">
          <ScrollArea className="h-full">
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
            <CardDescription>
              Please add a start date and end date to these milestones to include them in the gantt chart.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {milestones.filter(milestone => milestone.startDate == undefined || milestone.endDate === undefined).map(milestone => (
                <li className="w-full">
                  <Button className="w-full whitespace-normal h-auto" onClick={() => handleEditClick(milestone.nodeId)}>
                    <p className="text-wrap">{milestone.title}</p>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
          </ScrollArea>
        </Card>
        <GanttChart />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

export function GanttChart() {
    const [chartData, setChartData] = useState<DataPoint[]>([]);
    const { milestones } = useRoadmapStore(useShallow(selector))

    useEffect(() => {
      const data = ganttChartDataGenerator(milestones, 20, 60);
      const parsedData = data.map((d, i) => ({
        x: new Date(d.start_date).valueOf(),
        z: new Date(d.end_date).valueOf(),
        y: i,
        id: d.id,
        item: d.item,
        milestoneData: d.milestoneData
      }));

      setChartData(parsedData);
    }, [milestones]);
  
    const xDomain = useMemo(() => {
      const min = Math.min(...chartData.map(d => d.x))
      const max = Math.max(...chartData.map(d => d.z))
      return [min - 1000 * 60 * 60 * 24, max + 1000 * 60 * 60 * 24]
    }, [chartData])

    const generateXTicks = () => {
      const minDate = Math.min(...chartData.map(d => d.x))
      const maxDate = Math.max(...chartData.map(d => d.z))
      const ticks = []
      let currentTick = new Date(minDate)
      currentTick.setHours(0, 0, 0, 0)
  
      while (currentTick.valueOf() <= maxDate) {
        ticks.push(currentTick.valueOf())
        currentTick.setMonth(currentTick.getMonth() + 1)
      }
  
      return ticks
    }
  
    const formatXAxis = (tickItem: number) => {
      const date = new Date(tickItem)
      return `${date.getMonth() + 1}/${date.getFullYear()}`
    }
  
    const yDomain = useMemo(() => [0, chartData.length - 1], [chartData])

    const formatYAxis = (tickIndex: number) => {
      const dataPoint = chartData[tickIndex]
      return dataPoint?.milestoneData?.title || ''
    }
  
    return (
      <ChartContainer
          config={chartConfig}
          className="h-full w-full"
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
                  ticks={generateXTicks()}
                  tickFormatter={formatXAxis}
                  padding={{ left: 30, right: 30 }}
                  style={{ userSelect: "none" }}
              />
              <YAxis
                  type="number"
                  dataKey="y"
                  name="weight"
                  domain={yDomain}
                  tickCount={chartData.length}
                  tickFormatter={formatYAxis}
                  padding={{ top: 50, bottom: 50 }}
                  style={{ userSelect: "none" }}
                  width={150}
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
    )
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
      if (milestone.startDate && milestone.endDate) {
        data.push({
          id: index + 1,
          item: milestone.title,
          start_date: milestone.startDate?.toISOString(),
          end_date: milestone.endDate?.toISOString(),
          milestoneData: milestone
        })
      }
    })
  
    return data;
  };
