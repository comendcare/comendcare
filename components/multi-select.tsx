import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "./ui/badge"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList
} from "./ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { useController, UseControllerProps } from "react-hook-form"

type MultiSelectProps = {
    items: any[]
    maxSelectable?: number
    tooltip?: string
} & UseControllerProps

export default function MultiSelect({
    items,
    maxSelectable = 10,
    tooltip,
    name,
    control,
    defaultValue
}: MultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const {
        field: { value: selected = [], onChange: setSelected }
    } = useController({
        name,
        control,
        defaultValue: defaultValue || []
    })

    const handleUnselect = (item: any) => {
        setSelected(selected.filter((s: any) => s?.id !== item?.id))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current
        if (input) {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (input.value === "") {
                    const newSelected = [...selected]
                    newSelected.pop()
                    setSelected(newSelected)
                }
            }
            if (e.key === "Escape") {
                input.blur()
            }
        }
    }

    const selectables = items?.filter(
        item => !selected?.some((s: any) => s?.id === item?.id)
    )

    return (
        <Command
            onKeyDown={handleKeyDown}
            className="overflow-visible bg-transparent"
        >
            <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex gap-1 flex-wrap">
                    {selected?.map((item: any) => (
                        <Badge key={item?.id} variant="secondary">
                            {item?.name}
                            <button
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        handleUnselect(item)
                                    }
                                }}
                                onMouseDown={e => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                                onClick={() => handleUnselect(item)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                    {selected?.length < maxSelectable && (
                        <CommandPrimitive.Input
                            ref={inputRef}
                            value={inputValue}
                            onValueChange={setInputValue}
                            onBlur={() => setOpen(false)}
                            onFocus={() => setOpen(true)}
                            placeholder="Select item..."
                            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
                        />
                    )}
                </div>
            </div>
            <div className="relative mt-2">
                {open &&
                selectables.length > 0 &&
                selected.length < maxSelectable ? (
                    <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup className="h-full overflow-auto">
                                {selectables.map(item => (
                                    <CommandItem
                                        key={item?.id}
                                        onMouseDown={e => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        onSelect={() => {
                                            setInputValue("")
                                            setSelected([...selected, item])
                                        }}
                                        className="cursor-pointer"
                                    >
                                        {item?.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </div>
                ) : null}
            </div>
        </Command>
    )
}
