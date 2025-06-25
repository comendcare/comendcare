import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Define the input variants using class-variance-authority
const inputVariants = cva(
    "flex h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "px-3 py-2", // Standard padding for default variant
                currency: "py-2", // Only right padding for currency input (left will be handled separately)
            },
            size: {
                sm: "h-8 px-2",
                lg: "h-12 px-4",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "sm",
        },
    }
);

// Exclude the conflicting `size` prop from native input attributes
type HTMLInputPropsWithoutSize = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size"
>;

// Define the InputProps interface with VariantProps and adjusted HTML input props
export interface InputProps
    extends HTMLInputPropsWithoutSize,
        VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <div className={cn(variant === "currency" && "relative mt-2")}>
                <input
                    className={cn(
                        inputVariants({ variant, size, className }),
                        "w-full",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {variant === "currency" && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-gray-500 sm:text-sm">USD</span>
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input, inputVariants };
