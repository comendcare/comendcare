import {DataTable} from "@comend/components/biorepo/data-table";
import {columns} from "@comend/components/biorepo/columns"
import {useEffect, useState} from "react";
import {getBiosampleData} from "@comend/lib/fetchers";


export default function PharmaProjectBiorepositoryTab() {
    const [biosamples, setBiosamples] = useState<any[]>([])

    useEffect(() => {
        const fetchProjects = async () => {
            const result = await getBiosampleData()
            if (result.success && result.data) {
                setBiosamples(result.data)
            } else {
                setBiosamples([]) // or handle error differently
            }
        }

        fetchProjects()
    }, [])

    return (
        <div>
            <DataTable data={biosamples} columns={columns}/>
        </div>
    )
}
