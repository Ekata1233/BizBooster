
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
            header: 'Service Name',
            accessor: 'serviceName',
        },
        {
            header: 'Price',
            accessor: 'price',
        },
        {
            header: 'Discount Price',
            accessor: 'discountedPrice',
        },
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
        <div className="">
            <ComponentCard title="Subscribed Services">
                <BasicTableOne columns={columns} data={data} />
            </ComponentCard>
        </div>
    );
};

export default ProviderSubscribedServices;
