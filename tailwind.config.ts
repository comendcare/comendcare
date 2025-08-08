import type {Config} from "tailwindcss"
import * as path from 'path'

const svgToDataUri = require("mini-svg-data-uri")
const {
    default: flattenColorPalette
} = require("tailwindcss/lib/util/flattenColorPalette")

const config: Config = {
    important: true,
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "../../components/**/*.{ts,tsx}",
        path.join(
            path.dirname(require.resolve('@comend/components/package.json')),
            '**/*.{js,ts,jsx,tsx}'
        ),
        // "./node_modules/onborda/dist/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                    background: 'hsl(var(--secondary-background))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                },
                'color-1': 'hsl(var(--color-1))',
                'color-2': 'hsl(var(--color-2))',
                'color-3': 'hsl(var(--color-3))',
                'color-4': 'hsl(var(--color-4))',
                'color-5': 'hsl(var(--color-5))',
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                },
                brand: {
                    DEFAULT: 'hsl(var(--brand))',
                    foreground: 'hsl(var(--brand-foreground))'
                },
                highlight: {
                    DEFAULT: 'hsl(var(--highlight))',
                    foreground: 'hsl(var(--highlight-foreground))'
                },
                tool: {
                    DEFAULT: 'hsl(var(--tool))',
                    foreground: 'hsl(var(--tool-foreground))'
                },
                project: {
                    DEFAULT: 'hsl(var(--project))',
                    foreground: 'hsl(var(--project-foreground))'
                },
                rfp: {
                    DEFAULT: 'hsl(var(--rfp))',
                    foreground: 'hsl(var(--rfp-foreground))'
                },
                planned: {
                    DEFAULT: 'hsl(var(--planned))',
                    foreground: 'hsl(var(--planned-foreground))'
                },
                inprogress: {
                    DEFAULT: 'hsl(var(--inprogress))',
                    foreground: 'hsl(var(--inprogress-foreground))'
                },
                completed: {
                    DEFAULT: 'hsl(var(--completed))',
                    foreground: 'hsl(var(--completed-foreground))'
                },
                red: {
                    background: 'hsl(var(--background-red))', // red-100
                    border: 'hsl(var(--border-red))' // red-900
                },
                orange: {
                    background: 'hsl(var(--background-orange))', // orange-100
                    border: 'hsl(var(--border-orange))' // orange-900
                },
                amber: {
                    background: 'hsl(var(--background-amber))', // amber-100
                    border: 'hsl(var(--border-amber))' // amber-900
                },
                yellow: {
                    background: 'hsl(var(--background-yellow))', // yellow-100
                    border: 'hsl(var(--border-yellow))' // yellow-900
                },
                lime: {
                    background: 'hsl(var(--background-lime))', // lime-100
                    border: 'hsl(var(--border-lime))' // lime-900
                },
                green: {
                    background: 'hsl(var(--background-green))', // green-100
                    border: 'hsl(var(--border-green))' // green-900
                },
                emerald: {
                    background: 'hsl(var(--background-emerald))', // emerald-100
                    border: 'hsl(var(--border-emerald))' // emerald-900
                },
                teal: {
                    background: 'hsl(var(--background-teal))', // teal-100
                    border: 'hsl(var(--border-teal))' // teal-900
                },
                cyan: {
                    background: 'hsl(var(--background-cyan))', // cyan-100
                    border: 'hsl(var(--border-cyan))' // cyan-900
                },
                sky: {
                    background: 'hsl(var(--background-sky))', // sky-100
                    border: 'hsl(var(--border-sky))' // sky-900
                },
                blue: {
                    background: 'hsl(var(--background-blue))', // blue-100
                    border: 'hsl(var(--border-blue))', // blue-900
                    dark: 'hsl(var(--blue-dark))',
                    light: 'hsl(var(--blue-light))'
                },
                indigo: {
                    background: 'hsl(var(--background-indigo))', // indigo-100
                    border: 'hsl(var(--border-indigo))' // indigo-900
                },
                violet: {
                    background: 'hsl(var(--background-violet))', // violet-100
                    border: 'hsl(var(--border-violet))' // violet-900
                },
                purple: {
                    background: 'hsl(var(--background-purple))', // purple-100
                    border: 'hsl(var(--border-purple))' // purple-900
                },
                fuchsia: {
                    background: 'hsl(var(--background-fuchsia))', // fuchsia-100
                    border: 'hsl(var(--border-fuchsia))' // fuchsia-900
                },
                pink: {
                    background: 'hsl(var(--background-pink))', // pink-100
                    border: 'hsl(var(--border-pink))' // pink-900
                },
                rose: {
                    background: 'hsl(var(--background-rose))', // rose-100
                    border: 'hsl(var(--border-rose))' // rose-900
                },
                slate: {
                    background: 'hsl(var(--background-slate))', // slate-100
                    border: 'hsl(var(--border-slate))' // slate-900
                },
                gray: {
                    background: 'hsl(var(--background-gray))', // gray-100
                    border: 'hsl(var(--border-gray))' // gray-900
                },
                zinc: {
                    background: 'hsl(var(--background-zinc))', // zinc-100
                    border: 'hsl(var(--border-zinc))' // zinc-900
                },
                neutral: {
                    background: 'hsl(var(--background-neutral))', // neutral-100
                    border: 'hsl(var(--border-neutral))' // neutral-900
                },
                stone: {
                    background: 'hsl(var(--background-stone))', // stone-100
                    border: 'hsl(var(--border-stone))' // stone-900
                },

            },
            boxShadow: {
                derek: `0px 0px 0px 1px rgb(0 0 0 / 0.06),
        0px 1px 1px -0.5px rgb(0 0 0 / 0.06),
        0px 3px 3px -1.5px rgb(0 0 0 / 0.06), 
        0px 6px 6px -3px rgb(0 0 0 / 0.06),
        0px 12px 12px -6px rgb(0 0 0 / 0.06),
        0px 24px 24px -12px rgb(0 0 0 / 0.06)`,
                input: '`0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)`'
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            keyframes: {
                pulse: {
                    "0%, 100%": {boxShadow: "0 0 0 0 var(--pulse-color)"},
                    "50%": {boxShadow: "0 0 0 8px var(--pulse-color)"},
                },
                'accordion-down': {
                    from: {
                        height: '0'
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)'
                    }
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)'
                    },
                    to: {
                        height: '0'
                    }
                },
                gradient: {
                    to: {
                        backgroundPosition: 'var(--bg-size) 0'
                    }
                },
                marquee: {
                    from: {
                        transform: 'translateX(0)'
                    },
                    to: {
                        transform: 'translateX(calc(-100% - var(--gap)))'
                    }
                },
                'marquee-vertical': {
                    from: {
                        transform: 'translateY(0)'
                    },
                    to: {
                        transform: 'translateY(calc(-100% - var(--gap)))'
                    }
                },
                rainbow: {
                    '0%': {
                        'background-position': '0%'
                    },
                    '100%': {
                        'background-position': '200%'
                    }
                }
            },
            animation: {
                pulse: "pulse var(--duration) ease-out infinite",
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                gradient: 'gradient 8s linear infinite',
                marquee: 'marquee var(--duration) linear infinite',
                'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
                rainbow: 'rainbow var(--speed, 2s) infinite linear'
            },
            screens: {
                'main-hover': {
                    raw: '(hover: hover)'
                }
            }
        }
    },
    plugins: [
        require("tailwindcss-animate"),
        addVariablesForColors,
        function ({matchUtilities, theme}: any) {
            matchUtilities(
                {
                    "bg-dot-thick": (value: any) => ({
                        backgroundImage: `url("${svgToDataUri(
                            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="2.5"></circle></svg>`
                        )}")`
                    })
                },
                {
                    values: flattenColorPalette(theme("backgroundColor")),
                    type: "color"
                }
            )
        },
        require("tailwind-scrollbar-hide"),
        require("@tailwindcss/typography")
    ]
}
export default config

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({addBase, theme}: any) {
    let allColors = flattenColorPalette(theme("colors"))
    let newVars = Object.fromEntries(
        Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
    )

    addBase({
        ":root": newVars
    })
}
