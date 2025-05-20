import {PharmaChartAreaInteractive} from "@/components/pharma-chart-area-interactive"
import {PharmaDataTable} from "@/components/pharma-data-table"
import {PharmaDashboardSectionCards} from "@/components/pharma-dashboard-section-cards"

import data from "@/data/pharma-data.json"

export default function PharmaDashboardPage() {
    return (
        <>
            <PharmaDashboardSectionCards/>
            <div className="px-4 lg:px-6">
                <PharmaChartAreaInteractive/>
            </div>
            {/*<PharmaDataTable data={data}/>*/}
        </>
    )
}
