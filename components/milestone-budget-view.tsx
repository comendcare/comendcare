import React from "react"
import { FaDollarSign } from "react-icons/fa6"

export function BudgetView({budget}: {budget: number | undefined}) {
    if (budget) {
        return (
            <span className="flex gap-2 items-center text-bottom">
                <FaDollarSign size={24} />
                <p>{`$${budget.toLocaleString()}`}</p>
            </span>
        )
    }
}
