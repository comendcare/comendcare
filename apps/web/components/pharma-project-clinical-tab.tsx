import {DataTable} from "@/components/clinical/data-table";
import {columns} from "@/components/clinical/columns"
import {useEffect, useState} from "react";
import {getClinicalData} from "@/lib/fetchers";


export default function PharmaProjectClinicalTab() {
    const [clinicalData, setClinicalData] = useState<any[]>([])

    useEffect(() => {
        const fetchClinicalData = async () => {
            const result = await getClinicalData()
            if (result.success && result.data) {
                setClinicalData(result.data)
            } else {
                setClinicalData([]) // or handle error differently
            }
        }

        fetchClinicalData()
    }, [])

    return (
        <div>
            <DataTable data={clinicalData} columns={columns}/>
        </div>
    )
}
