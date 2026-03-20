'use client';

import {Command as CommandPrimitive, useCommandState} from 'cmdk';
import {X} from 'lucide-react';
import * as React from 'react';
import {forwardRef, useEffect} from 'react';

import {Badge} from './badge';
import {Command, CommandGroup, CommandItem, CommandList} from './command';
import {cn, sleep} from './../../../packages/lib/utils';
import {HoverCard, HoverCardContent, HoverCardTrigger} from "./hover-card";
import {ScrollArea} from './scroll-area';
import {DynamicIcon, IconName} from 'lucide-react/dynamic'
import { BadgeVariantType } from '@comend/lib/types';


export interface Option {
    value: string;
    label: string;
    disable?: boolean;
    /** fixed option that can't be removed. */
    fixed?: boolean;
    /** 
     * Pass in the lucide icon's name and the icon will by fetched dynamically (lower case)
     *  https://lucide.dev/guide/packages/lucide-react#dynamic-icon-component
     */
    icon?: IconName;
    variant?: BadgeVariantType;

    /** Group the options by providing key. */
    [key: string]: string | boolean | undefined | null;
}

export interface GroupOption {
    [key: string]: Option[];
}

type InputExtraData = { [key: `data-${string}`]: string }; // allow any data-* attribute

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
    createOnBlur?: boolean;
    /** Props of `Command` */
    commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
    /** Props of `CommandInput` */
    inputProps?: Omit<
        React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
        'value' | 'placeholder' | 'disabled'
    > & InputExtraData;
    /** hide the clear all button. */
    hideClearAllButton?: boolean;
    showHoverCard?: boolean;
    creatableItemOverride?: ({
        options, 
        selected, 
        inputValue,
        onSearch,
        debouncedSearchTerm,
        isLoading,
        maxSelected,
        onMaxSelected,
        setInputValue,
    } : {
        options: GroupOption, 
        selected: Option[], 
        inputValue: string,
        onSearch?: (value: string) => Promise<Option[]>,
        debouncedSearchTerm: string,
        isLoading: boolean,
        maxSelected: number,
        onMaxSelected: ((maxLimit: number) => void) | undefined,
        setInputValue: (value: React.SetStateAction<string>) => void
    }) => React.JSX.Element | undefined
    showCountInsteadOfSelected?: boolean
    showBadgesInDropdown?: boolean
}

export interface MultipleSelectorRef {
    selectedValue: Option[];
    input: HTMLInputElement;
    focus: () => void;
    reset: () => void;
    blur: () => void;
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

function transToGroupOption(options: Option[], groupBy?: string) {
    if (options.length === 0) {
        return {};
    }
    if (!groupBy) {
        return {
            '': options,
        };
    }

    const groupOption: GroupOption = {};
    options.forEach((option) => {
        const key = (option[groupBy] as string) || '';
        if (!groupOption[key]) {
            groupOption[key] = [];
        }
        groupOption[key].push(option);
    });
    return groupOption;
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
    const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption;

    for (const [key, value] of Object.entries(cloneOption)) {
        cloneOption[key] = value.filter((val) => !picked.find((p) => p.value === val.value));
    }
    return cloneOption;
}

export function isOptionsExist(groupOption: GroupOption, targetOption: Option[]) {
    for (const [, value] of Object.entries(groupOption)) {
        if (value.some((option) => targetOption.find((p) => p.value === option.value))) {
            return true;
        }
    }
    return false;
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

const MultipleSelector = React.forwardRef<MultipleSelectorRef, MultipleSelectorProps>(
    (
        {
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
            createOnBlur = true,
            triggerSearchOnFocus = false,
            commandProps,
            inputProps,
            hideClearAllButton = false,
            showHoverCard = true,
            creatableItemOverride,
            showCountInsteadOfSelected = false,
            showBadgesInDropdown = false
        }: MultipleSelectorProps,
        ref: React.Ref<MultipleSelectorRef>,
    ) => {
        const inputRef = React.useRef<HTMLInputElement>(null);
        const [open, setOpen] = React.useState(false);
        const [onScrollbar, setOnScrollbar] = React.useState(false);
        const [isLoading, setIsLoading] = React.useState(false);
        const dropdownRef = React.useRef<HTMLDivElement>(null); // Added this

        const [selected, setSelected] = React.useState<Option[]>(value || []);
        const [options, setOptions] = React.useState<GroupOption>(
            transToGroupOption(arrayDefaultOptions, groupBy),
        );
        const [inputValue, setInputValue] = React.useState('');
        const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

        React.useImperativeHandle(
            ref,
            () => ({
                selectedValue: [...selected],
                input: inputRef.current as HTMLInputElement,
                focus: () => inputRef?.current?.focus(),
                reset: () => setSelected([]),
                blur: () => inputRef?.current?.blur(),
            }),
            [selected],
        );

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
                inputRef.current.blur();
            }
        };

        const handleUnselect = React.useCallback(
            (option: Option) => {
                const newOptions = selected.filter((s) => s.value !== option.value);
                setSelected(newOptions);
                onChange?.(newOptions);
            },
            [onChange, selected],
        );

        const handleKeyDown = React.useCallback(
            (e: React.KeyboardEvent<HTMLDivElement>) => {
                const input = inputRef.current;
                if (input) {
                    if (e.key === 'Delete' || e.key === 'Backspace') {
                        if (input.value === '' && selected.length > 0) {
                            const lastSelectOption = selected[selected.length - 1];
                            // If last item is fixed, we should not remove it.
                            if (!lastSelectOption.fixed) {
                                handleUnselect(selected[selected.length - 1]);
                            }
                        }
                    }
                    // This is not a default behavior of the <input /> field
                    if (e.key === 'Escape') {
                        input.blur();
                    }
                }
            },
            [handleUnselect, selected],
        );

        useEffect(() => {
            if (open) {
                document.addEventListener('mousedown', handleClickOutside);
                document.addEventListener('touchend', handleClickOutside);
            } else {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('touchend', handleClickOutside);
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('touchend', handleClickOutside);
            };
        }, [open]);

        useEffect(() => {
            if (value) {
                setSelected(value);
            }
        }, [value]);

        useEffect(() => {
            /** If `onSearch` is provided, do not trigger options updated. */
            if (!arrayOptions || onSearch) {
                return;
            }
            const newOption = transToGroupOption(arrayOptions || [], groupBy);
            if (JSON.stringify(newOption) !== JSON.stringify(options)) {
                setOptions(newOption);
            }
        }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options]);

        useEffect(() => {
            /** sync search */

            const doSearchSync = () => {
                const res = onSearchSync?.(debouncedSearchTerm);
                setOptions(transToGroupOption(res || [], groupBy));
            };

            const exec = async () => {
                if (!onSearchSync || !open) return;

                if (triggerSearchOnFocus) {
                    doSearchSync();
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
                const res = await onSearch?.(debouncedSearchTerm);
                setOptions(transToGroupOption(res || [], groupBy));
                setIsLoading(false);
            };

            const exec = async () => {
                if (!onSearch || !open) return;

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

        const CreatableItem = () => {
            if (!creatable) return undefined;
            if (
                isOptionsExist(options, [{value: inputValue, label: inputValue}]) ||
                selected.find((s) => s.value === inputValue)
            ) {
                return undefined;
            }

            const Item = (
                <CommandItem
                    value={inputValue}
                    className="cursor-pointer"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onSelect={(value: string) => {
                        if (selected.length >= maxSelected) {
                            onMaxSelected?.(selected.length);
                            return;
                        }
                        setInputValue('');
                        const newOptions = [...selected, {value, label: value, new: true}];
                        setSelected(newOptions);
                        onChange?.(newOptions);
                    }}
                >
                    {`Create "${inputValue}"`}
                </CommandItem>
            );

            // For normal creatable
            if (!onSearch && inputValue.length > 0) {
                return Item;
            }

            // For async search creatable. avoid showing creatable item before loading at first.
            if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
                return Item;
            }

            return undefined;
        };

        const EmptyItem = React.useCallback(() => {
            if (!emptyIndicator) return undefined;

            // For async search that showing emptyIndicator
            if (onSearch && !creatable && Object.keys(options).length === 0) {
                return (
                    <CommandItem value="-" disabled>
                        {emptyIndicator}
                    </CommandItem>
                );
            }

            return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
        }, [creatable, emptyIndicator, onSearch, options]);

        const selectables = React.useMemo<GroupOption>(
            () => removePickedOption(options, selected),
            [options, selected],
        );

        /** Avoid Creatable Selector freezing or lagging when paste a long string. */
        // const commandFilter = React.useCallback(() => {
        //     if (commandProps?.filter) {
        //         return commandProps.filter;
        //     }

        //     if (creatable) {
        //         return (value: string, search: string) => {
        //             return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
        //         };
        //     }
        //     // Using default filter in `cmdk`. We don't have to provide it.
        //     return undefined;
        // }, [creatable, commandProps?.filter]);

        const autoId = React.useId();
        const listboxId = React.useId();

        return (
            <Command
                ref={dropdownRef}
                {...commandProps}
                onKeyDown={(e) => {
                    handleKeyDown(e);
                    commandProps?.onKeyDown?.(e);
                }}
                className={cn('h-auto overflow-visible bg-transparent', commandProps?.className)}
                shouldFilter={
                    commandProps?.shouldFilter !== undefined ? commandProps.shouldFilter : !onSearch
                } // When onSearch is provided, we don't want to filter the options. You can still override it.
                // filter={commandFilter()}
            >
                <div
                    className={cn(
                        'min-h-10 rounded-md border border-input text-base ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 md:text-sm',
                        {
                            'px-2 py-1': selected.length !== 0,
                            'cursor-text': !disabled && selected.length !== 0,
                        },
                        className,
                    )}
                    onClick={() => {
                        if (disabled) return;
                        inputRef?.current?.focus();
                    }}
                >
                    <div className="relative flex flex-wrap gap-1 items-center mr-8">
                        {showCountInsteadOfSelected ? (
                            selected && selected.length > 0 &&
                            <Badge
                                className={cn(
                                    'data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground',
                                    'data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground',
                                    badgeClassName,
                                )}
                                data-disabled={disabled || undefined}
                            >
                                {selected.length}
                            </Badge>
                        ) : (
                            selected && selected.map((option) => {
                                    return (
                                        <Badge
                                            key={option.value}
                                            className={cn(
                                                'data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground',
                                                'data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground',
                                                badgeClassName
                                            )}
                                            data-fixed={option.fixed}
                                            data-disabled={disabled || undefined}
                                            variant={option.variant || "secondary"}
                                        >
                                            {option.icon && (
                                                <DynamicIcon name={option.icon} className="h-4 w-4 min-w-4 min-h-4" />
                                            )}
                                            {typeof option.img === 'string' && (
                                                <img className="h-8 w-8 rounded-full mr-2 my-1" src={option.img}
                                                     alt="Option icon"/>
                                            )}
                                            {option.label}
                                            <button
                                                type="button"
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
                                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground"/>
                                            </button>
                                        </Badge>
                                    );
                                }
                            ))
                        }
                        {/* Avoid having the "Search" Icon */}
                        <CommandPrimitive.Input
                            {...inputProps}
                            id={inputProps?.id ?? autoId}
                            ref={inputRef}
                            role="combobox"
                            aria-expanded={open ? "true" : "false"}
                            aria-controls={listboxId}
                            value={inputValue}
                            disabled={maxSelected ? disabled || selected.length >= maxSelected : disabled}
                            onValueChange={(value) => {
                                setInputValue(value);
                                inputProps?.onValueChange?.(value);
                            }}
                            onBlur={(event) => {
                                if (!onScrollbar) {
                                    setOpen(false);
                                }

                                const trimmedValue = inputValue.trim();

                                if (
                                    creatable &&
                                    createOnBlur &&
                                    trimmedValue.length > 0 &&
                                    !selected.find((s) => s.value === trimmedValue) &&
                                    !Object.values(options).flat().some((opt) => opt.value === trimmedValue)
                                ) {
                                    const newOption = {value: trimmedValue, label: trimmedValue};
                                    const newOptions = [...selected, newOption];

                                    setSelected(newOptions);
                                    onChange?.(newOptions);
                                    setInputValue('');
                                }

                                inputProps?.onBlur?.(event);
                            }}
                            onFocus={(event) => {
                                setOpen(true);
                                inputProps?.onFocus?.(event);
                            }}
                            placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? '' : placeholder}
                            className={cn(
                                'flex-1 bg-transparent outline-none placeholder:text-muted-foreground',
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
                                'absolute -mr-8 top-0 right-0 h-6 w-6 p-0 pt-[2px] rounded-full bg-secondary',
                                (hideClearAllButton ||
                                    disabled ||
                                    selected.length < 1 ||
                                    selected.filter((s) => s.fixed).length === selected.length) &&
                                'hidden',
                            )}
                        >
                            <X className="h-4 w-4 mx-auto"/>
                        </button>
                    </div>
                </div>
                <div className="relative">
                    {open && (
                        <CommandList id={listboxId} role="listbox">
                            {open && (
                                <div
                                    className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                                    <ScrollArea
                                        className="max-h-[300px] overflow-auto"
                                        onMouseDown={(e) => e.preventDefault()} // Prevent focus loss on input
                                    >
                                        {showBadgesInDropdown && selected.length > 0 && (
                                            <TagTextarea
                                                selected={selected}
                                                value={inputValue}
                                                onValueChange={(v) => {
                                                    setInputValue(v);
                                                    inputProps?.onValueChange?.(v);
                                                }}
                                                onBackspaceWhenEmpty={() => {
                                                    const last = selected[selected.length - 1];
                                                    if (last && !last.fixed) {
                                                        handleUnselect(last);
                                                    }
                                                }}
                                                onUnselect={(opt) => handleUnselect(opt)}
                                                placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? "" : placeholder}
                                                disabled={maxSelected ? disabled || selected.length >= maxSelected : disabled}
                                                badgeClassName={badgeClassName}
                                                className={className}
                                                hidePlaceholderWhenSelected={hidePlaceholderWhenSelected}
                                            />
                                        )}
                                        {isLoading ? (
                                            <>{loadingIndicator}</>
                                        ) : Object.entries(selectables).flatMap(value => value[1]).length > 0 ? (
                                            <>
                                                {Object.entries(selectables).map(([key, values]) => (
                                                    <CommandGroup key={key} className="h-full"
                                                                  heading={groupBy ? key : undefined}>
                                                        {values.map((framework, index) => (
                                                            <HoverCard openDelay={0} closeDelay={0} key={index}>
                                                                <HoverCardTrigger>
                                                                    <CommandItem
                                                                        key={framework.value}
                                                                        onMouseDown={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                        }}
                                                                        onSelect={(value) => {
                                                                            setInputValue("");
                                                                            setSelected((prev) => {
                                                                                const closeDropdown = async () => {
                                                                                    await sleep(100) // sleep to delay setOpen, and avoid rendering errors
                                                                                    setOpen(false)
                                                                                }

                                                                                if (selected.length + 1 >= maxSelected) closeDropdown()
                                                                                onChange?.([...prev, framework]);
                                                                                return [...prev, framework];
                                                                            });
                                                                        }}
                                                                        className={cn("cursor-pointer multiselect-item", groupBy ? "pl-4" : "")}
                                                                    >
                                                                        {typeof framework.img === 'string' && (
                                                                            <img className="h-8 w-8 rounded-full mr-2"
                                                                                 src={framework.img} alt="Option icon"/>
                                                                        )}
                                                                        {framework.label}
                                                                        <p className="hidden">{framework.value}</p>
                                                                    </CommandItem>
                                                                </HoverCardTrigger>
                                                                {showHoverCard && (
                                                                    <HoverCardContent side="left" align="start"
                                                                                      className="h-min">
                                                                        <div className="grid gap-2">
                                                                            <h4 className="font-medium leading-none">{framework.label}</h4>
                                                                            <div
                                                                                className="text-sm text-muted-foreground">{framework.description}</div>
                                                                            {framework.strengths && (
                                                                                <div className="mt-4 grid gap-2">
                                                                                    <h5 className="text-sm font-medium leading-none">Strengths</h5>
                                                                                    <ul className="text-sm text-muted-foreground">{framework.strengths}</ul>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </HoverCardContent>
                                                                )}
                                                            </HoverCard>
                                                        ))}
                                                    </CommandGroup>
                                                ))}

                                            </>
                                        ) : (
                                            <CommandGroup className="h-full">
                                                <CommandItem value="-" disabled>
                                                    {emptyIndicator}
                                                </CommandItem>
                                            </CommandGroup>
                                        )}
                                    </ScrollArea>
                                    {creatableItemOverride 
                                        ? creatableItemOverride({
                                            options, 
                                            selected, 
                                            inputValue,
                                            onSearch,
                                            debouncedSearchTerm,
                                            isLoading,
                                            maxSelected,
                                            onMaxSelected,
                                            setInputValue
                                        }) 
                                        : CreatableItem()}
                                </div>
                            )}
                        </CommandList>
                    )}
                </div>
            </Command>
        );
    },
);

MultipleSelector.displayName = 'MultipleSelector';
export default MultipleSelector;


interface TagTextareaProps {
    /** The currently selected options (rendered as badges). */
    selected: Option[];
    /** Current free-text value inside the textarea. */
    value: string;
    /** Update the free-text value. */
    onValueChange: (v: string) => void;
    /** Called when user hits Backspace on an empty textarea. */
    onBackspaceWhenEmpty?: () => void;
    /** Called when a badge's X is clicked. */
    onUnselect?: (opt: Option) => void;
    placeholder?: string;
    disabled?: boolean;
    badgeClassName?: string;
    className?: string;
    textareaClassName?: string;
    /** Hide the placeholder if there are selected options. */
    hidePlaceholderWhenSelected?: boolean;
    /** Optional autoFocus */
    autoFocus?: boolean;
}

/**
 * TagTextarea — a multi-line, autosizing text area that renders the provided
 * `selected` options as shadcn/ui <Badge> elements inline above the caret area.
 *
 * This is designed as a drop-in replacement for an <input> in your MultipleSelector
 * so you can support multi-line entry while keeping the same badges UX.
 */
export const TagTextarea = React.forwardRef<HTMLTextAreaElement, TagTextareaProps>(
    (
        {
            selected,
            value,
            onValueChange,
            onBackspaceWhenEmpty,
            onUnselect,
            placeholder,
            disabled,
            badgeClassName,
            className,
            textareaClassName,
            hidePlaceholderWhenSelected,
            autoFocus,
        },
        ref
    ) => {
        const taRef = React.useRef<HTMLTextAreaElement | null>(null);
        React.useImperativeHandle(ref, () => taRef.current as HTMLTextAreaElement);

        // Autosize height to content.
        const autosize = React.useCallback(() => {
            const el = taRef.current;
            if (!el) return;
            el.style.height = "0px"; // reset first so scrollHeight is accurate
            el.style.height = Math.min(320, Math.max(40, el.scrollHeight)) + "px";
        }, []);

        React.useEffect(() => {
            autosize();
        }, [value, autosize, selected.length]);

        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if ((e.key === "Backspace" || e.key === "Delete") && value.trim() === "") {
                onBackspaceWhenEmpty?.();
            }
            if (e.key === "Escape") {
                (e.currentTarget as HTMLTextAreaElement).blur();
            }
        };

        const showPlaceholder = !hidePlaceholderWhenSelected || selected.length === 0;

        return (
            <div
                className={cn(
                    "min-h-10 rounded-md border border-input text-base ring-offset-background",
                    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 md:text-sm",
                    disabled && "opacity-60 cursor-not-allowed",
                    className
                )}
            >
                <div className={cn("relative flex flex-wrap items-start gap-1 p-2")}
                >
                    {selected?.map((option) => (
                        <Badge
                            key={option.value}
                            className={cn(
                                "text-xs data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground",
                                "data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground",
                                "shrink-0",
                                badgeClassName
                            )}
                            data-fixed={option.fixed}
                            data-disabled={disabled || undefined}
                        >
                            {typeof (option as any).img === "string" && (
                                <img
                                    className="h-6 w-6 rounded-full mr-1"
                                    src={(option as any).img as string}
                                    alt="Option icon"
                                />
                            )}
                            {option.label}
                            <button
                                type="button"
                                className={cn(
                                    "ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                    (disabled || option.fixed) && "hidden"
                                )}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        onUnselect?.(option);
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={() => onUnselect?.(option)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground"/>
                            </button>
                        </Badge>
                    ))}

                    {/* The textarea lives at the end so the caret appears after badges. */}
                    <textarea
                        ref={taRef}
                        disabled={disabled}
                        value={value}
                        onChange={(e) => onValueChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={showPlaceholder ? placeholder : ""}
                        rows={1}
                        className={cn(
                            "flex-1 resize-none bg-transparent outline-none placeholder:text-muted-foreground",
                            "min-h-[40px] py-2 px-1 leading-5",
                            // Ensure it wraps nicely under badges and expands vertically
                            "w-full",
                            textareaClassName
                        )}
                        autoFocus={autoFocus}
                    />
                </div>
            </div>
        );
    }
);
TagTextarea.displayName = "TagTextarea";
