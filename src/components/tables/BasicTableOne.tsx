import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

type Column<T> = {
  header: string;
  accessor: keyof T | string;
  render?: (row: T) => React.ReactNode;
};

interface BasicTableOneProps<T> {
  columns: Column<T>[];
  data: T[];
}

export default function BasicTableOne<T>({ columns, data }: BasicTableOneProps<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {columns.map((column, idx) => (
                  <TableCell
                    key={idx}
                    isHeader
                    className="px-2 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    {column.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className="px-2 py-4 text-start text-gray-500 text-sm dark:text-gray-400"
                    >
                      {column.render ? (
                        column.render(row)
                      ) : (
                        (row[column.accessor as keyof T] as React.ReactNode) ?? ""
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
