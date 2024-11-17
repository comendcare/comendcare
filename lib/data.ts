import {CheckCircledIcon, CrossCircledIcon, StopwatchIcon} from "@radix-ui/react-icons";

export const labels = [
    {
        value: "bug",
        label: "Bug",
    },
    {
        value: "feature",
        label: "Feature",
    },
    {
        value: "documentation",
        label: "Documentation",
    },
]

export const statuses = [
    {
        value: "not started",
        label: "Not Started",
        icon: CrossCircledIcon,
    },
    {
        value: "in progress",
        label: "In Progress",
        icon: StopwatchIcon,
    },
    {
        value: "submitted",
        label: "Submitted",
        icon: CheckCircledIcon,
    },
]

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