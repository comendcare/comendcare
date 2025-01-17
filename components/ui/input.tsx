import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
    "flex h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "px-3 py-2",
                currency: "pr-20 py-2",
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

type HTMLInputPropsWithoutSize = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size"
>;

export interface InputProps
    extends HTMLInputPropsWithoutSize,
        VariantProps<typeof inputVariants> {}

const formatNumberWithCommas = (value: string | undefined) => {
    const numericValue = (value || "").replace(/[^0-9]/g, ""); // Ensure value is a string
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, size, onChange, value, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (variant === "currency") {
                const formattedValue = formatNumberWithCommas(e.target.value);
                // Trigger the external onChange if provided
                onChange?.({
                    ...e,
                    target: { ...e.target, value: formattedValue },
                } as React.ChangeEvent<HTMLInputElement>);
            } else {
                onChange?.(e);
            }
        };

        // Convert value to a string or undefined
        const stringValue =
            value === undefined || value === null
                ? undefined
                : typeof value === "string"
                    ? value
                    : value.toString();

        return (
            <div className={cn(variant === "currency" && "relative mt-2")}>
                {variant === "currency" && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                )}
                <input
                    className={cn(
                        inputVariants({ variant, size, className }),
                        "w-full",
                        variant === "currency" && "pl-6",
                        className
                    )}
                    ref={ref}
                    onChange={handleChange}
                    value={variant === "currency" ? formatNumberWithCommas(stringValue) : stringValue}
                    {...props}
                />
                {variant === "currency" && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-8">
                        <span className="text-gray-500 sm:text-sm">USD</span>
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input, inputVariants };