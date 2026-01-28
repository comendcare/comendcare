"use client";
import {useReducer} from "react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormDescription,
    FormMessage
} from "./ui/form";
import {Input} from "./ui/input"; // ShadCN UI Input
import {UseFormReturn} from "react-hook-form";
import {cn, formatMoney} from "./../../packages/lib/utils";


type TextInputProps = {
    form: UseFormReturn<any>;
    name: string;
    label?: string;
    description?: string;
    placeholder?: string;
    cents?: boolean;
    mixpanelTrackCallback?: (budget: number) => void
};

// U.S. currency config
const createMoneyFormatter = (cents: boolean) => Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
});

export default function MoneyInput(props: TextInputProps & {className?: string}) {
    const { form, name, cents = false } = props;
    const moneyFormatter = createMoneyFormatter(cents);

    // Read initial numeric value (could be undefined)
    const initialNumber = form.getValues()[name] as number | undefined;

    // Initial display string: formatted if number, else empty
    const initialDisplay = typeof initialNumber === "number"
        ? moneyFormatter.format(initialNumber)
        : "";

    const [display, setDisplay] = useReducer((_: string, next: string) => {
        const digits = next.replace(/\D/g, "");
        if (!digits) return ""; // allow truly empty
        const factor = cents ? 100 : 1;
        return moneyFormatter.format(Number(digits) / factor);
    }, initialDisplay);

    function handleChange(realChangeFn: (v: number | undefined) => void, formattedValue: string) {
        const digits = formattedValue.replace(/\D/g, "");
        if (!digits) {
            realChangeFn(undefined); // <-- cleared
            return;
        }
        const factor = cents ? 100 : 1;
        const realValue = Number(digits) / factor;
        realChangeFn(realValue);
    }

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => {
                const onRealChange = (v: number | undefined) => {
                    if (props.mixpanelTrackCallback && typeof v === "number") props.mixpanelTrackCallback(v);
                    field.onChange(v);
                };

                return (
                    <FormItem id={name}>
                        {props.label && <FormLabel>{props.label}</FormLabel>}
                        {props.description && <FormDescription className="flex items-center">{props.description}</FormDescription>}
                        <FormControl>
                            <Input
                                className={cn(props.className)}
                                variant="currency"
                                placeholder={props.placeholder || ""}
                                type="text"
                                // IMPORTANT: do not spread {...field} because field.value is a number/undefined,
                                // but our input displays a formatted string.
                                onChange={(ev) => {
                                    const next = ev.target.value;
                                    setDisplay(next);
                                    handleChange(onRealChange, next);
                                }}
                                onBlur={field.onBlur}
                                value={display}
                                name={field.name}
                                ref={field.ref}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
