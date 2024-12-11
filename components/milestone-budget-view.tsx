import React from "react"
import { FaDollarSign } from "react-icons/fa6"

export function BudgetView({budget}: {budget: number | undefined}) {
    if (budget) {
        return (
            <span className="flex items-center text-bottom">
                <FaDollarSign 
                    className="mr-1.5 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                />
                <p>{`${budget.toLocaleString()}`}</p>
            </span>
        )
    }
}
