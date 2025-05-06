import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {Active, DataRef, Over} from "@dnd-kit/core";
import {ColumnDragData} from "@/components/board-column";
import {TaskDragData} from "@/components/task-card";
import {identicon, personas} from "@dicebear/collection";
import {createAvatar} from "@dicebear/core";
import {formatDistanceToNowStrict} from "date-fns";
import {ImportField} from "@/lib/types";
import Papa from "papaparse";
import type { Option } from "@/lib/types";

// get the items that are in group A but NOT in group B
export const getExclusiveToFirstGroup = (a: {[key]: Option[]}, b: {[key]: Option[]}, key: string) => {
    return (a?.[key] || [])?.filter((optionA: Option) => (!(b?.[key] || []).map(optionB => optionB.value).includes(optionA.value)))
}

export const getDates = (milestone: any) => {
    if (milestone.startDate && milestone.endDate) {
        return (
            `${new Date(milestone.startDate).toLocaleString('en-US', {
                month: 'short',
                year: 'numeric'
            })} - ${new Date(milestone.endDate).toLocaleString('en-US', {
                month: 'short',
                year: 'numeric'
            })}`
        )
    }

    if (milestone.startDate) {
        return (
            `${new Date(milestone.startDate).toLocaleString('en-US', {
                month: 'short',
                year: 'numeric'
            })}`
        )
    }

    if (milestone.endDate) {
        return (
            `${new Date(milestone.endDate).toLocaleString('en-US', {
                month: 'short',
                year: 'numeric'
            })}`
        )
    }
}

export const validateImport = (entry: any, expectedValues: ImportField[]) => {
    const errors: {key: string, message: string, object: any}[] = []

    expectedValues.forEach(({key, required, isValid}) => {
        // if required, check if value exists
        if (required && !entry[key]) {
            errors.push({key, message: `Required field ${key} is missing`, object: entry})
            return
        }

        // if value exists, check if it's valid
        if (entry[key] && !isValid(entry[key])) {
            errors.push({key, message: `Field ${key} is not formatted properly`, object: entry})
            return
        }
    })

    if (errors.length > 0) {
        return {isValid: false, errors: errors}
    }

    return {isValid: true, errors: []}
}

export function parseCSV(file: File, expectedValues: ImportField[]): Promise<{values: any[], errors: {key: string, message: string, object: any}[]}> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true, // Adjust based on whether your CSV has headers
            skipEmptyLines: true,
            complete: (result) => {
                const newValues: any[] = []
                let errors: {key: string, message: string, object: any}[] = []

                try {
                    result.data.forEach((entry: any) => {
                        const validate = validateImport(entry, expectedValues)
                        if (validate.isValid && !validate.errors) {
                            newValues.push(entry)
                        } else {
                            errors = errors.concat(validate.errors)

                            const attemptValue = Object.fromEntries(
                                expectedValues.map(({key, defaultValue}) => [key, entry[key] || defaultValue || undefined])
                            )
                            newValues.push(attemptValue)
                        }
                    })
                } catch (e) {
                    console.error("Error: failed to import tools", e)
                    reject(e)
                }

                resolve({values: newValues, errors: errors})
            },
            error: (error) => reject(error),
        });
    });
}

export const acceptedFiletypes = {
    "image/*": [".jpg", ".jpeg", ".png"],
};

export function toTitleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

export function standardizeYear(dateString: string): string {
    const match = dateString.match(/^(\d{4})/);
    return match ? match[1] : "";
}

export function formatNumberWithCommas(number: string | undefined) {
    if (number === undefined) return "0"

    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const sendTypeSenseRequest = async (
    url: string,
    method: string,
    apiKey: string,
    data?: any,
) => {
    const headers = {
        'Content-Type': 'application/json',
        'X-TYPESENSE-API-KEY': apiKey,
    };

    const body = data ? JSON.stringify(data) : undefined;
    const response = await fetch(url, {method, headers, body});
    return response?.json() ?? null;
};

// TypeSense collection management
export const createTypeSenseCollection = async (
    typesenseUrl: string,
    apiKey: string,
    data: any,
) => {
    const url = `${typesenseUrl}/collections`;
    return sendTypeSenseRequest(url, 'POST', apiKey, data);
};

export const deleteTypeSenseCollection = async (
    typesenseUrl: string,
    apiKey: string,
    data: any,
) => {
    const url = `${typesenseUrl}/collections`;
    return sendTypeSenseRequest(url, 'POST', apiKey, data);
}

export const addTypeSenseDocument = async (
    typesenseUrl: string,
    apiKey: string,
    data: any,
    documentType: string
) => {
    const url = `${typesenseUrl}/collections/${documentType}/documents`;
    return sendTypeSenseRequest(url, 'POST', apiKey, data);
};

export const updateTypeSenseDocument = async (
    typesenseUrl: string,
    apiKey: string,
    data: any,
    documentType: string
) => {
    const url = `${typesenseUrl}/collections/${documentType}/documents/${data.id}`;
    return sendTypeSenseRequest(url, 'PATCH', apiKey, data);
};

export const deleteTypeSenseDocument = async (
    typesenseUrl: string,
    apiKey: string,
    id: string,
    documentType: string
) => {
    const url = `${typesenseUrl}/collections/${documentType}/documents/${id}`;
    return sendTypeSenseRequest(url, 'DELETE', apiKey);
};

export function toKebabCase(name: string) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
        .replace(/^-+|-+$/g, '');   // Remove leading or trailing hyphens
}

export function formatDates(date: Date) {
    const distance = formatDistanceToNowStrict(new Date(date));
    const formattedDistance = distance
        .replace("seconds", "s")
        .replace("second", "s")
        .replace("minutes", "m")
        .replace("minute", "m")
        .replace("hours", "h")
        .replace("hour", "h")
        .replace("days", "d")
        .replace("day", "d")
        .replace("months", "mo")
        .replace("month", "mo")
        .replace("years", "y")
        .replace("year", "y");

    return formattedDistance;
}

export const years = Array.from({ length: new Date().getFullYear() - 1970 + 1 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
)

export async function getPublicFile(fileUrl: string): Promise<File> {
    try {
        // Make a GET request to your API endpoint
        const response = await fetch(`/api/gcs?fileUrl=${encodeURIComponent(fileUrl)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })

        console.log(`response`, response)

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        // Parse the response as JSON
        const { name, type, data } = await response.json();

        // Decode the base64 data into a Blob
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type });

        // Create the File object
        return new File([blob], name, { type });
    } catch (error) {
        console.error('Error fetching file:', error);
        throw error;
    }
}

export function abbreviateNumber(num: number | null | undefined) {
    if (num === null || num === undefined) return '';
    if (num < 1000) return num.toString(); // No abbreviation needed

    const units = ['K', 'M', 'B', 'T', 'Q']; // Thousand, Million, Billion, Trillion, Quadrillion
    let unitIndex = -1;

    while (Math.abs(num) >= 1000 && unitIndex < units.length - 1) {
        num /= 1000;
        unitIndex++;
    }

    return `${parseFloat(num.toFixed(1))}${units[unitIndex]}`;
}

export const formatMoney = (moneyRaised: number | undefined) => {
    if (moneyRaised === undefined) return "0";

    const formatNumber = (num: number, divisor: number, suffix: string) => {
        const formatted = (num / divisor).toFixed(1);
        return formatted.endsWith(".0") ? `${Math.round(num / divisor)}${suffix}` : `${formatted}${suffix}`;
    };

    if (moneyRaised >= 1_000_000) {
        return formatNumber(moneyRaised, 1_000_000, "M");
    } else if (moneyRaised >= 1_000) {
        return formatNumber(moneyRaised, 1_000, "K");
    } else {
        return moneyRaised.toLocaleString();
    }
};

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month}, ${year}`;
}

export const mapsFetcher = (url: string) => fetch(url).then((r) => r.json());

export const isOnboarded = (tutorialName: string) => {
    const onboarded = localStorage.getItem(tutorialName)
    return !(onboarded === null)
}

export const setOnboarded = (tutorialName: string) => {
    localStorage.setItem(tutorialName, "true")
}

type DraggableData = ColumnDragData | TaskDragData

export function hasDraggableData<T extends Active | Over>(
    entry: T | null | undefined
): entry is T & {
    data: DataRef<DraggableData>
} {
    if (!entry) {
        return false
    }

    const data = entry.data.current

    if (data?.type === "Column" || data?.type === "Task") {
        return true
    }

    return false
}

export const getIp = async (): Promise<string> => {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export async function fetcher<JSON = any>(
    input: RequestInfo,
    init?: RequestInit
): Promise<JSON> {
    const response = await fetch(input, { ...init, cache: "no-store" })

    return response.json()
}

export const capitalize = (s: string) => {
    if (typeof s !== "string") return ""
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export const truncate = (str: string, num: number) => {
    if (!str) return ""
    if (str.length <= num) {
        return str
    }
    return str.slice(0, num) + "..."
}

export const getBlurDataURL = async (url: string | null) => {
    if (!url) {
        return "data:image/webp;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
    }
    try {
        const response = await fetch(
            `https://wsrv.nl/?url=${url}&w=50&h=50&blur=5`
        )
        const buffer = await response.arrayBuffer()
        const base64 = Buffer.from(buffer).toString("base64")

        return `data:image/png;base64,${base64}`
    } catch (error) {
        return "data:image/webp;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
    }
}

export const placeholderBlurhash =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAoJJREFUWEfFl4lu4zAMRO3cx/9/au6reMaOdkxTTl0grQFCRoqaT+SQotq2bV9N8rRt28xms87m83l553eZ/9vr9Wpkz+ezkT0ej+6dv1X81AFw7M4FBACPVn2c1Z3zLgDeJwHgeLFYdAARYioAEAKJEG2WAjl3gCwNYymQQ9b7/V4spmIAwO6Wy2VnAMikBWlDURBELf8CuN1uHQSrPwMAHK5WqwFELQ01AIXdAa7XawfAb3p6AOwK5+v1ugAoEq4FRSFLgavfQ49jAGQpAE5wjgGCeRrGdBArwHOPcwFcLpcGU1X0IsBuN5tNgYhaiFFwHTiAwq8I+O5xfj6fOz38K+X/fYAdb7fbAgFAjIJ6Aav3AYlQ6nfnDoDz0+lUxNiLALvf7XaDNGQ6GANQBKR85V27B4D3QQRw7hGIYlQKWGM79hSweyCUe1blXhEAogfABwHAXAcqSYkxCtHLUK3XBajSc4Dj8dilAeiSAgD2+30BAEKV4GKcAuDqB4TdYwBgPQByCgApUBoE4EJUGvxUjF3Q69/zLw3g/HA45ABKgdIQu+JPIyDnisCfAxAFNFM0EFNQ64gfS0EUoQP8ighrZSjn3oziZEQpauyKbfjbZchHUL/3AS/Dd30gAkxuRACgfO+EWQW8qwI1o+wseNuKcQiESjALvwNoMI0TcRzD4lFcPYwIM+JTF5x6HOs8yI7jeB5oKhpMRFH9UwaSCDB2Jmg4rc6E2TT0biIaG0rQhNqyhpHBcayTTSXH6vcDL7/sdqRK8LkwTsU499E8vRcAojHcZ4AxABdilgrp4lsXk8oVqgwh7+6H3phqd8J0Kk4vbx/+sZqCD/vNLya/5dT9fAH8g1WdNGgwbQAAAABJRU5ErkJggg=="

export const toDateString = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    })
}

export const random = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function createDicebearAvatar(seed: string, radius: number, size: number, style?: string) {
    let selectedStyle;
    let options: any = {
        seed: seed,
        radius: radius,
        size: size,
        backgroundColor: [
            'b6e3f4', 'c0aede', 'd1d4f9', 'a3c9f1', 'b5d0ff',
            'd4c3ef', 'c4cfff', 'b7d2f4', 'e0dafc', 'a8c6e9',
            'b2d2f9', 'd7e4fa'
        ]
    };

    switch (style) {
        case 'identicon':
            selectedStyle = identicon;
            break;
        case 'personas':
        default:
            selectedStyle = personas;
            options.mouth = ['bigSmile', 'smirk', 'lips'];
            break;
    }

    return createAvatar(selectedStyle, options).toDataUri();
}

// Helper function to standardize error logging
export function logError(context: string, error: any) {
    console.error(`${context}:`, error);
}

export function nameToInitials(name: string | null | undefined): string | undefined{
    if (!name) return
    return name
        .split(' ') // Split the name into parts by spaces
        .map(part => part.charAt(0).toUpperCase()) // Take the first letter of each part and capitalize it
        .join(''); // Join the initials together
}
