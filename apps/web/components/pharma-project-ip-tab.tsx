import {DataTable} from "@comend/components/ip/data-table";
import {columns} from "@comend/components/ip/columns"
import {useEffect, useState} from "react";
import {getIPData} from "@comend/lib/fetchers";


export default function PharmaProjectIPTab() {
    const [IPData, setIPData] = useState<any[]>([])

    useEffect(() => {
        const fetchIPData = async () => {
            const result = await getIPData()
            if (result.success && result.data) {
                setIPData(result.data)
            } else {
                setIPData([]) // or handle error differently
            }
        }

        fetchIPData()
    }, [])

    return (
        <div>
            <DataTable data={IPData} columns={columns}/>
        </div>
    )
}
