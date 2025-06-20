"use client";

import AddressAutoComplete from "@/components/address-autocomplete";
import { AddressType } from "@/lib/types";

interface AddressAutocompleteComponentProps {
    address: AddressType;
    setAddress: (address: AddressType) => void;
    searchInput: string;
    setSearchInput: (input: string) => void;
}

export const AddressAutocompleteComponent = ({
                                          address,
                                          setAddress,
                                          searchInput,
                                          setSearchInput
                                      }: AddressAutocompleteComponentProps) => {
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
