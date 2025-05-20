import {DataTable} from "@/components/pre-clinical/data-table";
import {columns} from "@/components/pre-clinical/columns"
import {useEffect, useState} from "react";
import {getPreclinicalData} from "@/lib/fetchers";


export default function PharmaProjectPreclinicalTab() {
    const [preclinicalData, setPreclinicalData] = useState<any[]>([])

    useEffect(() => {
        const fetchPreclinicalData = async () => {
            const result = await getPreclinicalData()
            if (result.success && result.data) {
                setPreclinicalData(result.data)
            } else {
                setPreclinicalData([]) // or handle error differently
            }
        }

        fetchPreclinicalData()
    }, [])

    return (
        <div>
            <DataTable data={preclinicalData} columns={columns}/>
        </div>
    )
}
