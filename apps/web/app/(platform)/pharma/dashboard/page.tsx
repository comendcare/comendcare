import {PharmaChartAreaInteractive} from "~web/components/pharma-chart-area-interactive"
import {PharmaDataTable} from "~web/components/pharma-data-table"
import {PharmaDashboardSectionCards} from "~web/components/pharma-dashboard-section-cards"

// import data from "@/data/pharma-data.json"

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
