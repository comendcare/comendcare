import {CheckCircledIcon, CrossCircledIcon, StopwatchIcon} from "@radix-ui/react-icons";
import {FaSuitcase, FaFlaskVial, FaUsers} from "react-icons/fa6";

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

export const types = [
    {
        value: "pag",
        label: "Patient group",
        icon: FaUsers,
    },
    {
        value: "researcher",
        label: "Researcher",
        icon: FaFlaskVial,
    },
    {
        value: "cro",
        label: "Contractor",
        icon: FaSuitcase,
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