import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.css";
import {ThemeProvider} from "@/app/theme-provider";
import {LandingNavbar} from "@/components/layout/sections/landing-navbar";

import {GeistSans} from "geist/font/sans";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

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
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
        >
            <LandingNavbar/>
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}
