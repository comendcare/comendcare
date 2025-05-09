import * as React from "react"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "@/lib/utils"

const badgeVariants = cva(
    // "inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "inline-flex gap-1 items-center font-semibold text-md min-h-7 rounded-md px-2 py-1",
    {
        variants: {
            variant: {
                default:
                    // "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 rounded-md",
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                positive: "border-transparent bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20",
                outline: "text-foreground",
                
                lightBlue: "border-transparent bg-blue-light text-blue-dark hover:bg-blue-light",

                red: "border-transparent bg-red-100 text-red-900 hover:bg-red-100",
                orange: "border-transparent bg-orange-100 text-orange-900 hover:bg-orange-100",
                amber: "border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100",
                yellow: "border-transparent bg-yellow-100 text-yellow-900 hover:bg-yellow-100",
                lime: "border-transparent bg-lime-100 text-lime-900 hover:bg-lime-100",
                green: "border-transparent bg-green-100 text-green-900 hover:bg-green-100",
                emerald: "border-transparent bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
                teal: "border-transparent bg-teal-100 text-teal-900 hover:bg-teal-100",
                cyan: "border-transparent bg-cyan-100 text-cyan-900 hover:bg-cyan-100",
                sky: "border-transparent bg-sky-100 text-sky-900 hover:bg-sky-100",
                blue: "border-transparent bg-blue-100 text-blue-900 hover:bg-blue-100",
                indigo: "border-transparent bg-indigo-100 text-indigo-900 hover:bg-indigo-100",
                violet: "border-transparent bg-violet-100 text-violet-900 hover:bg-violet-100",
                purple: "border-transparent bg-purple-100 text-purple-900 hover:bg-purple-100",
                fuchsia: "border-transparent bg-fuchsia-100 text-fuchsia-900 hover:bg-fuchsia-100",
                pink: "border-transparent bg-pink-100 text-pink-900 hover:bg-pink-100",
                rose: "border-transparent bg-rose-100 text-rose-900 hover:bg-rose-100",
                slate: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100",
                gray: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100",
                zinc: "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100",
                neutral: "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-100",
                stone: "border-transparent bg-stone-100 text-stone-900 hover:bg-stone-100",
            },
            size: {
                default: "px-2.5 py-0.5 text-md",
                large: "px-4 py-1 text-lg"
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default"
        }
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {
}

function Badge({className, variant, size, ...props}: BadgeProps) {
    return (
        <div className={cn(badgeVariants({variant, size}), className)} {...props} />
    )
}

export {Badge, badgeVariants}
