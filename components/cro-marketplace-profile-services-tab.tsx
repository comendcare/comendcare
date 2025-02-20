import {Company, Service} from "@prisma/client";
import {CROServicesDataTable} from "@/components/cro-services-data-table/cro-services-data-table";
import {columns} from "@/components/cro-services-data-table/cro-services-data-columns";


export default function CROMarketplaceProfileServicesTab({croServices}: {croServices: Service[]}) {
    return (
        <div>
            <CROServicesDataTable data={croServices} columns={columns}/>
        </div>
    )
}
