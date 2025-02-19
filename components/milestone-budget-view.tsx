import React from "react"
import { FaDollarSign } from "react-icons/fa6"

export function BudgetView({budget}: {budget: number | undefined}) {
    if (budget) {
        return (
            <span className="flex items-center gap-2 text-bottom">
                <FaDollarSign
                    aria-hidden="true"
                />
                <p>{`${budget.toLocaleString()}`}</p>
            </span>
        )
    }
}
