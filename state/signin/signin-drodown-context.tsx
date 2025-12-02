"use client";

import {createContext, useContext, useState} from "react";

type SigninDropdownContextValue = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

const SigninDropdownContext = createContext<SigninDropdownContextValue | null>(null);

export const SigninDropdownProvider = ({children}: {children: React.ReactNode}) => {
    const [open, setOpen] = useState(false);
    return (
        <SigninDropdownContext.Provider value={{open, setOpen}}>
            {children}
        </SigninDropdownContext.Provider>
    );
};

export const useSigninDropdown = () => {
    const ctx = useContext(SigninDropdownContext);
    if (!ctx) {
        throw new Error("useAuthDropdown must be used within an AuthDropdownProvider");
    }
    return ctx;
};
