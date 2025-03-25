"use client";
import {useReducer} from "react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormDescription,
    FormMessage
} from "@/components/ui/form";
import {Input} from "@/components/ui/input"; // ShadCN UI Input
import {UseFormReturn} from "react-hook-form";
import {cn, formatMoney} from "@/lib/utils";


type TextInputProps = {
    form: UseFormReturn<any>;
    name: string;
    label?: string;
    description?: string;
    placeholder?: string;
    cents?: boolean;
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

    const initialValue = form.getValues()[name]
        ? moneyFormatter.format(form.getValues()[name])
        : "";

    const [value, setValue] = useReducer((_: any, next: string) => {
        const digits = next.replace(/\D/g, "");
        const factor = cents ? 100 : 1;
        return moneyFormatter.format(Number(digits) / factor);
    }, initialValue);

    function handleChange(realChangeFn: Function, formattedValue: string) {
        const digits = formattedValue.replace(/\D/g, "");
        const factor = cents ? 100 : 1;
        const realValue = Number(digits) / factor;
        realChangeFn(realValue);
    }

    return (
        <FormField
            control={form.control}
            name={name}
            render={({field}) => {
                field.value = value;
                const _change = field.onChange;

                return (
                    <FormItem>
                        {props.label &&
                            <FormLabel>{props.label}</FormLabel>
                        }
                        {props.description &&
                            <FormDescription className="flex items-center">
                                {props.description}
                            </FormDescription>
                        }
                        <FormControl>
                            <Input
                                className={cn(props.className)}
                                variant={"currency"}
                                placeholder={props.placeholder || ""}
                                type="text"
                                {...field}
                                onChange={(ev) => {
                                    setValue(ev.target.value);
                                    handleChange(_change, ev.target.value);
                                }}
                                value={value}
                            />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                );
            }}
        />
    );
}
