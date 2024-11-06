import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"
import {Active, DataRef, Over} from "@dnd-kit/core";
import {ColumnDragData} from "@/components/board-column";
import {TaskDragData} from "@/components/task-card";
import {personas, identicon} from "@dicebear/collection";
import {createAvatar} from "@dicebear/core";

export const monthsList = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

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
