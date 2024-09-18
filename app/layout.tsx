import type {Metadata} from "next";
import "./globals.css";
import {ThemeProvider} from "@/app/theme-provider";
import {LandingNavbar} from "@/components/layout/sections/landing-navbar";

import {GeistSans} from "geist/font/sans";

export const metadata: Metadata = {
    title: "Comend",
    description: "Software for rare disease patient groups",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={`${GeistSans.variable}`}>
        <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}
