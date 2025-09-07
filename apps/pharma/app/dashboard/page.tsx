import {PharmaChartAreaInteractive} from "comend-pag-platform/components/pharma-chart-area-interactive"
import {PharmaDashboardSectionCards} from "comend-pag-platform/components/pharma-dashboard-section-cards"

// import data from "@comend/data/pharma-data.json"

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
