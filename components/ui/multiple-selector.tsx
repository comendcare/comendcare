'use client';

// Huge thanks to the person behind this incredibly robust component:
// https://shadcnui-expansions.typeart.cc/docs/multiple-selector

import {Command as CommandPrimitive, useCommandState} from 'cmdk';
import {X} from 'lucide-react';
import * as React from 'react';
import {forwardRef, useEffect} from 'react';

import {Badge} from '@/components/ui/badge';
import {Command, CommandGroup, CommandItem, CommandList} from '@/components/ui/command';
import {cn, sleep} from '@/lib/utils';
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {useMutationObserver} from "@/lib/hooks/use-mutation-observer";
import { ScrollArea } from './scroll-area';

export interface Option {
    value: string;
    label: string;
    disable?: boolean;
    /** fixed option that can't be removed. */
    fixed?: boolean;

    /** Group the options by providing key. */
    [key: string]: string | boolean | undefined;
}

interface GroupOption {
    [key: string]: Option[];
}

interface MultipleSelectorProps {
    value?: Option[];
    defaultOptions?: Option[];
    /** manually controlled options */
    options?: Option[];
    placeholder?: string;
    /** Loading component. */
    loadingIndicator?: React.ReactNode;
    /** Empty component. */
    emptyIndicator?: React.ReactNode;
    /** Debounce time for async search. Only work with `onSearch`. */
    delay?: number;
    /**
     * Only work with `onSearch` prop. Trigger search when `onFocus`.
     * For example, when user click on the input, it will trigger the search to get initial options.
     **/
    triggerSearchOnFocus?: boolean;
    /** async search */
    onSearch?: (value: string) => Promise<Option[]>;
    /**
     * sync search. This search will not showing loadingIndicator.
     * The rest props are the same as async search.
     * i.e.: creatable, groupBy, delay.
     **/
    onSearchSync?: (value: string) => Option[];
    onChange?: (options: Option[]) => void;
    /** Limit the maximum number of selected options. */
    maxSelected?: number;
    /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
    onMaxSelected?: (maxLimit: number) => void;
    /** Hide the placeholder when there are options selected. */
    hidePlaceholderWhenSelected?: boolean;
    disabled?: boolean;
    /** Group the options base on provided key. */
    groupBy?: string;
    className?: string;
    badgeClassName?: string;
    /**
     * First item selected is a default behavior by cmdk. That is why the default is true.
     * This is a workaround solution by add a dummy item.
     *
     * @reference: https://github.com/pacocoursey/cmdk/issues/171
     */
    selectFirstItem?: boolean;
    /** Allow user to create option when there is no option matched. */
    creatable?: boolean;
    /** Props of `Command` */
    commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
    /** Props of `CommandInput` */
    inputProps?: Omit<
        React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
        'value' | 'placeholder' | 'disabled'
    >;
    /** hide the clear all button. */
    hideClearAllButton?: boolean;
    showHoverCard?: boolean;
}

export function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * The `CommandEmpty` of shadcn/ui will cause the cmdk empty not rendering correctly.
 * So we create one and copy the `Empty` implementation from `cmdk`.
 *
 * @reference: https://github.com/hsuanyi-chou/shadcn-ui-expansions/issues/34#issuecomment-1949561607
 **/
const CommandEmpty = forwardRef<
    HTMLDivElement,
    React.ComponentProps<typeof CommandPrimitive.Empty>
>(({className, ...props}, forwardedRef) => {
    const render = useCommandState((state) => state.filtered.count === 0);

    if (!render) return null;

    return (
        <div
            ref={forwardedRef}
            className={cn('py-6 text-center text-sm', className)}
            cmdk-empty=""
            role="presentation"
            {...props}
        />
    );
});

CommandEmpty.displayName = 'CommandEmpty';

export function MultipleSelector({
    value,
    onChange,
    placeholder,
    defaultOptions: arrayDefaultOptions = [],
    options: arrayOptions,
    delay,
    onSearch,
    onSearchSync,
    loadingIndicator,
    emptyIndicator,
    maxSelected = Number.MAX_SAFE_INTEGER,
    onMaxSelected,
    hidePlaceholderWhenSelected,
    disabled,
    groupBy,
    className,
    badgeClassName,
    selectFirstItem = true,
    creatable = false,
    triggerSearchOnFocus = false,
    commandProps,
    inputProps,
    hideClearAllButton = false,
    showHoverCard = true,
}: MultipleSelectorProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<Option[]>(value || []);
    const [selectables, setSelectables] = React.useState<Option[]>(arrayDefaultOptions ? arrayDefaultOptions.filter((framework) => !selected.includes(framework)) : [])
    const [inputValue, setInputValue] = React.useState("");
    const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

    const handleUnselect = React.useCallback((framework: Option) => {
        setSelected((prev) => prev.filter((s) => s.value !== framework.value));
    }, []);

    useEffect(() => {
        onChange && onChange(selected)
    }, [selected])

    useEffect(() => {
        /** sync search */

        const doSearchSync = async () => {
            setIsLoading(true);
            const res = onSearchSync?.(debouncedSearchTerm) || selectables;
            setSelectables(res || []);
            setIsLoading(false);
        };

        const exec = async () => {
            // if (!onSearchSync || !open) return;
            console.log(`debounced search term`, debouncedSearchTerm)
            if (!open) return;

            if (triggerSearchOnFocus) {
                await doSearchSync();
            }

            if (debouncedSearchTerm) {
                doSearchSync();
            }
        };

        void exec();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);

    useEffect(() => {
        /** async search */

        const doSearch = async () => {
            setIsLoading(true);
            const res = await onSearch?.(debouncedSearchTerm) || selectables;
            setSelectables(res || []);
            setIsLoading(false);
        };

        const exec = async () => {
            // if (!onSearch || !open) return;
            console.log(`debounced search term`, debouncedSearchTerm)
            if (!open) return;

            if (triggerSearchOnFocus) {
                await doSearch();
            }

            if (debouncedSearchTerm) {
                await doSearch();
            }
        };

        void exec();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
            if (e.key === "Delete" || e.key === "Backspace") {
            if (input.value === "") {
                setSelected((prev) => {
                const newSelected = [...prev];
                newSelected.pop();
                return newSelected;
                });
            }
            }
            // This is not a default behaviour of the <input /> field
            if (e.key === "Escape") {
            input.blur();
            }
        }
        },
        [],
    );

    return (
        <Command
            onKeyDown={handleKeyDown}
            className="overflow-visible bg-transparent"
        >
        <div 
            className={cn(
                'min-h-10 rounded-md border border-input text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                {
                    'px-3 py-2': selected.length !== 0,
                    'cursor-text': !disabled && selected.length !== 0,
                },
                className,
            )}
            onClick={() => {
                if (disabled) return;
                inputRef?.current?.focus();
            }}
        >
            <div className="relative flex flex-wrap gap-1">
            {selected.map((option) => {
                return (
                    <Badge
                        key={option.value}
                        className={cn(
                            'data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground',
                            'data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground',
                            badgeClassName,
                        )}
                        data-fixed={option.fixed}
                        data-disabled={disabled || undefined}
                    >
                        {option.label}
                        <button
                            className={cn(
                                'ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2',
                                (disabled || option.fixed) && 'hidden',
                            )}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleUnselect(option);
                                }
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onClick={() => handleUnselect(option)}
                        >
                            <X className="h-2 w-2 text- text-muted-foreground hover:text-foreground"/>
                        </button>
                    </Badge>
                );
            })}
            {/* Avoid having the "Search" Icon */}
            <CommandPrimitive.Input
                ref={inputRef}
                value={inputValue}
                disabled={disabled || selected.length === maxSelected}
                onValueChange={(value) => {
                    setInputValue(value);
                    inputProps?.onValueChange?.(value);
                }}
                onBlur={(event) => {
                    setOpen(false);
                }}
                onFocus={(event) => {
                    if (selected.length < maxSelected) {
                        setOpen(true);
                        triggerSearchOnFocus && onSearch?.(debouncedSearchTerm);
                        inputProps?.onFocus?.(event);
                    }
                }}
                onClick={() => {
                    if (selected.length < maxSelected) {
                        setOpen(true)
                    }
                }}
                placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? '' : placeholder}
                className={cn(
                    "ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
                    {
                        'w-full': hidePlaceholderWhenSelected,
                        'px-3 py-2': selected.length === 0,
                        'ml-1': selected.length !== 0,
                    },
                    inputProps?.className,
                )}
            />
            <button
                type="button"
                onClick={() => {
                    setSelected(selected.filter((s) => s.fixed));
                    onChange?.(selected.filter((s) => s.fixed));
                }}
                className={cn(
                    'absolute right-0 h-6 w-6 p-0',
                    (hideClearAllButton ||
                        disabled ||
                        selected.length < 1 ||
                        selected.filter((s) => s.fixed).length === selected.length) &&
                    'hidden',
                )}
            >
                <X/>
            </button>
            </div>
        </div>

        <div className="relative mt-2">
            <CommandList>
                {open && (
                    <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                        <ScrollArea className="max-h-[300px] overflow-auto">
                            {isLoading && (
                                <>{loadingIndicator}</>
                            )}
                            {!isLoading ? (
                                <>
                                <CommandEmpty>{emptyIndicator}</CommandEmpty>
                                <CommandGroup 
                                    className="h-full"
                                >
                                    {selectables.length > 0 && (
                                        selectables.map((framework) => {
                                            return (
                                                <HoverCard openDelay={0} closeDelay={0}>
                                                    <HoverCardTrigger>
                                                    <CommandItem
                                                        key={framework.value}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        }}
                                                        onSelect={(value) => {
                                                        setInputValue("");
                                                        setSelected((prev) => [...prev, framework]);
                                                            if (selected.length + 1 >= maxSelected) setOpen(false)
                                                        }}
                                                        className={"cursor-pointer multiselect-item"}
                                                    >
                                                        {framework.label}
                                                    </CommandItem>
                                                    </HoverCardTrigger>
                                                    {showHoverCard && (
                                                        <HoverCardContent
                                                            side="left"
                                                            align="start"
                                                            className="min-h-[280px]"
                                                        >
                                                            <div className="grid gap-2">
                                                                <h4 className="font-medium leading-none">{framework.label}</h4>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {framework.description}
                                                                </div>
                                                                {framework.strengths ? (
                                                                    <div className="mt-4 grid gap-2">
                                                                        <h5 className="text-sm font-medium leading-none">
                                                                            Strengths
                                                                        </h5>
                                                                        <ul className="text-sm text-muted-foreground">
                                                                            {framework.strengths}
                                                                        </ul>
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </HoverCardContent>
                                                    )}
                                                </HoverCard>
                                            );
                                        })
                                    )}
                                </CommandGroup>
                                </>
                            ) : (
                                <CommandGroup className="h-full">
                                    <CommandItem value="-" disabled>
                                        {emptyIndicator}
                                    </CommandItem>
                                </CommandGroup>
                            )}
                        </ScrollArea>
                    </div>
                )}
            </CommandList>
        </div>
        </Command>
    );
}

MultipleSelector.displayName = 'MultipleSelector';
export default MultipleSelector;
