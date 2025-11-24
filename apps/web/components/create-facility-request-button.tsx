import { Button } from "@comend/components/ui/button";
import { GroupOption, isOptionsExist, MultipleSelectorRef, Option } from "@comend/components/ui/multiple-selector";

export const SubmitCreateRequest = ({
    options, 
    selected, 
    inputValue,
    onSearch,
    debouncedSearchTerm,
    isLoading,
    maxSelected,
    onMaxSelected,
    setInputValue,
    onClickCallback,
    parentRef
} : {
    options: GroupOption, 
    selected: Option[], 
    inputValue: string,
    onSearch?: (value: string) => Promise<Option[]>,
    debouncedSearchTerm: string,
    isLoading: boolean,
    maxSelected: number,
    onMaxSelected: ((maxLimit: number) => void) | undefined,
    setInputValue: (value: React.SetStateAction<string>) => void,
    onClickCallback?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => any
    parentRef: React.RefObject<MultipleSelectorRef>
}) => {
    if (
        isOptionsExist(options, [{value: inputValue, label: inputValue}]) ||
        selected.find((s) => s.value === inputValue)
    ) {
        return undefined;
    }

    const Item = (
        <Button
            value={undefined}
            variant={'ghost'}
            className="hover:cursor-pointer w-full justify-start max-h-8 p-0 text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50"
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onClick={(e) => {
                setInputValue("")
                parentRef?.current?.blur()
                onClickCallback && onClickCallback(e)
            }}
        >
            {`Submit creation request for "${inputValue}"`}
        </Button>
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
}