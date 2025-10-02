// import React, { useEffect, useState } from 'react'
// import ComponentCard from '../common/ComponentCard'
// import Input from '../form/input/InputField'
// import BasicTableOne from '../tables/BasicTableOne'
// import Link from 'next/link';
// import { EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';
// import { Provider } from '@/context/ProviderContext';
// import { useCheckout } from '@/context/CheckoutContext';


// interface ServiceCustomer {
//     fullName: string;
//     email: string;
//     city: string;
// }

// interface BookingRow {
//     _id: string;
//     bookingId: string;
//     serviceCustomer: ServiceCustomer;
//     totalAmount: number;
//     paymentStatus: string;
//     scheduleDate?: string;
//     bookingDate: string;
//     orderStatus: string;
// }

// interface Props {
//     provider: Provider;
// }

// const ProviderBookings: React.FC<Props> = ({ provider }) => {

//     const {
//         checkouts,
//         loading,
//         error,
//         fetchCheckoutsByProviderId,
//     } = useCheckout();

//     const [search, setSearch] = useState('');

//     useEffect(() => {
//         if (provider._id) {
//             fetchCheckoutsByProviderId(provider._id);
//         }
//     }, [provider]);

//     console.log("checkout : ", checkouts)


//     const columns = [
//         {
//             header: 'Booking ID',
//             accessor: 'bookingId',
//         },
//         {
//             header: 'Customer Info',
//             accessor: 'customerInfo',
//             render: (row: BookingRow) => {
//                 // console.log("Customer Info Row:", row); // 👈 This will log the entire row object
//                 return (
//                     <div className="text-sm">
//                         <p className="font-medium text-gray-900">{row.serviceCustomer?.fullName || 'N/A'}</p>
//                         <p className="text-gray-500">{row.serviceCustomer?.email || ''}</p>
//                         <p className="text-gray-500">{row.serviceCustomer?.city || ''}</p>

//                     </div>
//                 );
//             },
//         },
//         {
//             header: 'Total Amount',
//             accessor: 'totalAmount',
//             render: (row: BookingRow) => (
//                 <span className="text-gray-800 font-semibold">₹ {row.totalAmount}</span>
//             ),
//         },
//         {
//             header: 'Payment Status',
//             accessor: 'paymentStatus',
//             render: (row: BookingRow) => {
//                 const status = row.paymentStatus;
//                 const statusColor = status === 'paid'
//                     ? 'bg-green-100 text-green-700 border-green-300'
//                     : 'bg-yellow-100 text-yellow-700 border-yellow-300';

//                 return (
//                     <span className={`px-3 py-1 rounded-full text-sm border ${statusColor}`}>
//                         {status}
//                     </span>
//                 );
//             },
//         },
//         {
//             header: 'Schedule Date',
//             accessor: 'scheduleDate',
//             render: (row: BookingRow) => (
//                 <span>{row.scheduleDate ? new Date(row.scheduleDate).toLocaleString() : 'N/A'}</span>
//             ),
//         },
//         {
//             header: 'Booking Date',
//             accessor: 'bookingDate',
//             render: (row: BookingRow) => (
//                 <span>{new Date(row.bookingDate).toLocaleString()}</span>
//             ),
//         },
//         {
//             header: 'Status',
//             accessor: 'orderStatus',
//             render: (row: BookingRow) => {
//                 let colorClass = '';
//                 switch (row.orderStatus) {
//                     case 'processing':
//                         colorClass = 'bg-blue-100 text-blue-700 border border-blue-300';
//                         break;
//                     case 'completed':
//                         colorClass = 'bg-green-100 text-green-700 border border-green-300';
//                         break;
//                     case 'canceled':
//                         colorClass = 'bg-red-100 text-red-700 border border-red-300';
//                         break;
//                     default:
//                         colorClass = 'bg-gray-100 text-gray-700 border border-gray-300';
//                 }

//                 return (
//                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
//                         {row.orderStatus}
//                     </span>
//                 );
//             },
//         },
//         {
//             header: 'Action',
//             accessor: 'action',
//             render: (row: BookingRow) => (
//                 <div className="flex gap-2">
//                     <Link href={`/booking-management/all-bookings/${row._id}`} passHref>
//                         <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
//                             <EyeIcon />
//                         </button>
//                     </Link>
//                     {/* <button
//             onClick={() => alert(`Viewing booking ID: ${row.bookingId}`)}
//             className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white"
//           >
//             <EyeIcon />
//           </button> */}
//                     <button
//                         onClick={() => alert(`Editing booking ID: ${row.bookingId}`)}
//                         className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
//                     >
//                         <PencilIcon />
//                     </button>
//                     <button
//                         onClick={() => alert(`Deleting booking ID: ${row.bookingId}`)}
//                         className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//                     >
//                         <TrashBinIcon />
//                     </button>
//                 </div>
//             ),
//         },
//     ];

//     const data: BookingRow[] = checkouts.map((checkout) => ({
//         bookingId: checkout.bookingId,
//         serviceCustomer: checkout.serviceCustomer as unknown as ServiceCustomer,
//         totalAmount: checkout.totalAmount,
//         paymentStatus: checkout.paymentStatus,
//         scheduleDate: checkout.createdAt,
//         bookingDate: checkout.createdAt,
//         orderStatus: checkout.orderStatus,
//         _id: checkout._id,
//     }));


//     return (
//         <div className="">
//             <ComponentCard title="Booking Details">
//                 <div className="mb-4">
//                     <Input
//                         type="text"
//                         placeholder="Search by Booking ID…"
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
//                     />
//                 </div>

//                 {data.length > 0 ? (
//                     <BasicTableOne columns={columns} data={data} />
//                 ) : (
//                     <p className="text-sm text-gray-500">No accepted request data to display.</p>
//                 )}
//             </ComponentCard>
//         </div>
//     )
// }

// export default ProviderBookings

'use client';

import React, { useEffect, useState, useMemo } from 'react'
import ComponentCard from '../common/ComponentCard'
import Input from '../form/input/InputField'
import BasicTableOne from '../tables/BasicTableOne'
import Pagination from '../tables/Pagination'
import Link from 'next/link';
import { EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';
import { Provider } from '@/context/ProviderContext';
import { useCheckout } from '@/context/CheckoutContext';

interface ServiceCustomer {
    fullName: string;
    email: string;
    city: string;
}

interface BookingRow {
    _id: string;
    bookingId: string;
    serviceCustomer: ServiceCustomer;
    totalAmount: number;
    paymentStatus: string;
    scheduleDate?: string;
    bookingDate: string;
    orderStatus: string;
}

interface Props {
    provider: Provider;
}

const ProviderBookings: React.FC<Props> = ({ provider }) => {
    const { checkouts, loading, error, fetchCheckoutsByProviderId } = useCheckout();

    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        if (provider._id) {
            fetchCheckoutsByProviderId(provider._id);
        }
    }, [provider, fetchCheckoutsByProviderId]);

    const columns = [
        { header: 'Booking ID', accessor: 'bookingId' },
        {
            header: 'Customer Info',
            accessor: 'customerInfo',
            render: (row: BookingRow) => (
                <div className="text-sm">
                    <p className="font-medium text-gray-900">{row.serviceCustomer?.fullName || 'N/A'}</p>
                    <p className="text-gray-500">{row.serviceCustomer?.email || ''}</p>
                    <p className="text-gray-500">{row.serviceCustomer?.city || ''}</p>
                </div>
            ),
        },
        {
            header: 'Total Amount',
            accessor: 'totalAmount',
            render: (row: BookingRow) => (
                <span className="text-gray-800 font-semibold">₹ {row.totalAmount}</span>
            ),
        },
        {
            header: 'Payment Status',
            accessor: 'paymentStatus',
            render: (row: BookingRow) => {
                const status = row.paymentStatus;
                const statusColor = status === 'paid'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-300';
                return (
                    <span className={`px-3 py-1 rounded-full text-sm border ${statusColor}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            header: 'Schedule Date',
            accessor: 'scheduleDate',
            render: (row: BookingRow) => (
                <span>{row.scheduleDate ? new Date(row.scheduleDate).toLocaleString() : 'N/A'}</span>
            ),
        },
        {
            header: 'Booking Date',
            accessor: 'bookingDate',
            render: (row: BookingRow) => (
                <span>{new Date(row.bookingDate).toLocaleString()}</span>
            ),
        },
        {
            header: 'Status',
            accessor: 'orderStatus',
            render: (row: BookingRow) => {
                let colorClass = '';
                switch (row.orderStatus) {
                    case 'processing':
                        colorClass = 'bg-blue-100 text-blue-700 border border-blue-300';
                        break;
                    case 'completed':
                        colorClass = 'bg-green-100 text-green-700 border border-green-300';
                        break;
                    case 'canceled':
                        colorClass = 'bg-red-100 text-red-700 border border-red-300';
                        break;
                    default:
                        colorClass = 'bg-gray-100 text-gray-700 border border-gray-300';
                }
                return (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
                        {row.orderStatus}
                    </span>
                );
            },
        },
        {
            header: 'Action',
            accessor: 'action',
            render: (row: BookingRow) => (
                <div className="flex gap-2">
                    <Link href={`/booking-management/all-booking/${row._id}`} passHref>
                        <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
                            <EyeIcon />
                        </button>
                    </Link>
                    {/* <button
                        onClick={() => alert(`Editing booking ID: ${row.bookingId}`)}
                        className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                    >
                        <PencilIcon />
                    </button>
                    <button
                        onClick={() => alert(`Deleting booking ID: ${row.bookingId}`)}
                        className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
                    >
                        <TrashBinIcon />
                    </button> */}
                </div>
            ),
        },
    ];

    // Filter data by search
    const filteredData = useMemo(() => {
        return checkouts
            .map((checkout) => ({
                bookingId: checkout.bookingId,
                serviceCustomer: checkout.serviceCustomer as unknown as ServiceCustomer,
                totalAmount: checkout.totalAmount,
                paymentStatus: checkout.paymentStatus,
                scheduleDate: checkout.createdAt,
                bookingDate: checkout.createdAt,
                orderStatus: checkout.orderStatus,
                _id: checkout._id,
            }))
            .filter((item) =>
                item.bookingId.toLowerCase().includes(search.toLowerCase())
            );
    }, [checkouts, search]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const paginatedData = filteredData.slice(indexOfFirstRow, indexOfLastRow);

    return (
        <div>
            <ComponentCard title="Booking Details">
                <div className="mb-4">
                    <Input
                        type="text"
                        placeholder="Search by Booking ID…"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1); // Reset page on search
                        }}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                    />
                </div>

                {paginatedData.length > 0 ? (
                    <>
                        <BasicTableOne columns={columns} data={paginatedData} />
                        <div className="flex justify-center mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={filteredData.length}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-gray-500">No accepted request data to display.</p>
                )}
            </ComponentCard>
        </div>
    )
}

export default ProviderBookings;
