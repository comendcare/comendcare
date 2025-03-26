import { CircleDollarSign } from "lucide-react"
import React from "react"

export function BudgetView({budget}: {budget: number | undefined}) {
    if (budget) {
        return (
            <span className="flex items-center gap-2 text-bottom">
                <CircleDollarSign
                    aria-hidden="true"
                />
                <p>{`${budget.toLocaleString()}`}</p>
            </span>
        )
    }
}
