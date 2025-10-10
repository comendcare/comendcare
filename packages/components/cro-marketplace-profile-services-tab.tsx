import type {Company, Service} from "@prisma/client";
import {CROServicesDataTable} from "comend-pag-platform/components/cro-services-data-table/cro-services-data-table";
import {columns} from "comend-pag-platform/components/cro-services-data-table/cro-services-data-columns";


export default function CROMarketplaceProfileServicesTab({croServices}: {croServices: Service[]}) {
    return (
        <div>
            <CROServicesDataTable data={croServices} columns={columns}/>
        </div>
    )
}
