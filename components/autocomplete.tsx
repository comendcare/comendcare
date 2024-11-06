"use client";

import AddressAutoComplete from "@/components/address-autocomplete";
import { AddressType } from "@/lib/types";

interface AutocompleteComponentProps {
    address: AddressType;
    setAddress: (address: AddressType) => void;
    searchInput: string;
    setSearchInput: (input: string) => void;
}

export const AutocompleteComponent = ({
                                          address,
                                          setAddress,
                                          searchInput,
                                          setSearchInput
                                      }: AutocompleteComponentProps) => {
    return (
        <AddressAutoComplete
            address={address}
            setAddress={setAddress}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            dialogTitle="Enter Address"
        />
    );
};
