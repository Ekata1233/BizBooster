
import Link from 'next/link';
import { EyeIcon } from '@/icons';
import BasicTableOne from '../tables/BasicTableOne';
import { TableData } from '@/app/(admin)/provider-management/provider-details/[id]/page';
import PageBreadcrumb from '../common/PageBreadCrumb';
import ComponentCard from '../common/ComponentCard';

interface Props {
    data: TableData[];
}

const ProviderSubscribedServices: React.FC<Props> = ({ data }) => {
    const columns = [
        {
            header: 'Sr No',
            accessor: 'srNo',
            render: (_row: TableData, index: number) => (
                <span className="text-gray-700 text-sm font-medium">{index + 1}</span>
            ),
        },
        {
            header: 'Service Name',
            accessor: 'serviceName',
        },
        // {
        //     header: 'Price',
        //     accessor: 'price',
        // },
        // {
        //     header: 'Discount Price',
        //     accessor: 'discountedPrice',
        // },
        {
            header: 'Status',
            accessor: 'status',
            render: (row: TableData) => {
                const status = row.isDeleted;
                let colorClass = status
                    ? 'text-red-500 bg-red-100 border border-red-300'
                    : 'text-green-600 bg-green-100 border border-green-300';
                return (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
                        {status ? 'Inactive' : 'Active'}
                    </span>
                );
            },
        },
        {
            header: 'Action',
            accessor: 'action',
            render: (row: TableData) => (
                <div className="flex gap-2">
                    <Link href={`/service-management/service-details/${row.id}`} passHref>
                        <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
                            <EyeIcon />
                        </button>
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div>
        <ComponentCard title="Subscribed Services">
            {data && data.length > 0 ? (
                <BasicTableOne columns={columns} data={data} />
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <EyeIcon className="w-12 h-12 mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-1">No Subscribed Services Found</h3>
                    <p className="text-sm text-gray-500 text-center">
                        This provider has not subscribed to any services yet.
                    </p>
                </div>
            )}
        </ComponentCard>
    </div>
    );
};

export default ProviderSubscribedServices;
