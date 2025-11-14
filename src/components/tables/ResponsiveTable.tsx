"use client";
import React from "react";

type Column<T> = {
  header: string;
  accessor: keyof T | string;
  render?: (row: T, index: number) => React.ReactNode;
};

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  page: number;
  limit: number;
  total: number;
  onPageChange: (nextPage: number) => void;
}

const ResponsiveTable = <T extends Record<string, any>>({
  columns,
  data,
  page,
  limit,
  total,
  onPageChange,
}: Props<T>) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="w-full">
      {/* Table container: gives both vertical and horizontal scrolling */}
      <div className="w-full border border-gray-200 rounded-lg">
        {/* This div provides the scrolling area. Adjust max-h as needed */}
        <div className="max-h-[520px] overflow-auto">
          {/* Use a wide-min table so horizontal overflow works when cells are many/wide */}
          <table className="min-w-full table-auto divide-y divide-gray-300">
            <thead className="bg-gray-100">
              <tr className="sticky top-0 z-20">
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-6 text-center text-gray-500"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
                      >
                        {col.render ? col.render(row, rowIndex) : row[col.accessor as keyof T]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>

        <div className="flex space-x-2">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className={`px-4 py-2 rounded border ${page === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-100"
              }`}
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className={`px-4 py-2 rounded border ${page === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-100"
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTable;
