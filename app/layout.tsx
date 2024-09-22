import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/app/theme-provider";
import { LandingNavbar } from "@/components/layout/sections/landing-navbar";

// Import Montserrat Display and Source Sans Pro
import {Poppins, Source_Sans_3} from "next/font/google";

// Set up Playfair Display and Source Sans 3 fonts
const playfairDisplay = Poppins({
    subsets: ["latin"],
    weight: ["400", "700"], // Regular and bold weights
    variable: "--font-poppins", // Create a CSS variable for the font
    display: "swap",
});

const sourceSans3 = Source_Sans_3({
    subsets: ["latin"],
    weight: ["400", "700"], // Regular and bold weights
    variable: "--font-source-sans-pro", // Create a CSS variable for the font
    display: "swap",
});

export const metadata: Metadata = {
    title: "Comend",
    description: "Software for rare disease patient groups",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${playfairDisplay.variable} ${sourceSans3.variable}`}
        >
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
