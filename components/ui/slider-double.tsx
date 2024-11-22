// from https://github.com/shadcn-ui/ui/issues/871#issuecomment-1625673445
'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { ChartConfig, ChartContainer, ChartTooltip } from './chart';
import { Bar, BarChart, CartesianGrid, Cell, XAxis } from 'recharts';
import { useEffect } from 'react';

const DoubleSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>

    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
DoubleSlider.displayName = SliderPrimitive.Root.displayName;

const chartConfig = {
  data: {
      label: "value",
  },
} satisfies ChartConfig

const DoubleSliderBarChart = (props: any) => {
  
  return (
    <div className="flex flex-col gap-0">
      <ChartContainer config={chartConfig} className="h-[40px] w-full -mb-2">
      <BarChart accessibilityLayer data={props.chartData}>
          <Bar 
            dataKey="data" 
            radius={[4, 4, 0, 0]} 
          >
            {
              props.chartData.map((value: any, index: number) => {
                const color = (
                  value.xAxis*props.step >= props.value[0] && (value.xAxis+1)*props.step <= props.value[1]
                ) ? 
                  "hsl(var(--primary))" : 
                  "hsl(var(--secondary))"

                return <Cell key={`cell-${index}`} fill={color} />
              })
            }
          </Bar>
      </BarChart>
      </ChartContainer>
      <DoubleSlider 
          step={props.step} 
          minStepsBetweenThumbs={1}
          defaultValue={props.range}
          min={props.range[0]}
          max={props.range[1]}
          value={props.value}
          onValueChange={props.onChange}
      />
      <span className="flex flex-row justify-between mt-4">
          <p>{props.value ? props.value[0].toLocaleString() : props.range[0].toLocaleString()}</p>
          <p>{props.value ? props.value[1].toLocaleString() : props.range[1].toLocaleString()}</p>
      </span>
    </div>
  )
}

export { DoubleSlider, DoubleSliderBarChart };