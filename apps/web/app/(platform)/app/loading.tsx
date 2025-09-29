"use client"

import ComendLoadingSpinner from "@comend/components/comend-loading-spinner"
import {useLoadingTimeout} from "~web/hooks/useLoadingTimeout";

export default function Loading() {
    useLoadingTimeout(5000)

    return <ComendLoadingSpinner />
}
