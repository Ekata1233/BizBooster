// type PaginationProps = {
//   currentPage: number;
//    totalItems: number;    
//   totalPages: number;
//   onPageChange: (page: number) => void;
// };

// const Pagination: React.FC<PaginationProps> = ({
//   currentPage,
//   totalItems,
//   totalPages,
//   onPageChange,
// }) => {
//   const pagesAroundCurrent = Array.from(
//     { length: Math.min(3, totalPages) },
//     (_, i) => i + Math.max(currentPage - 1, 1)
//   );

//   return (
//     <div className="flex items-center ">
//       <button
//         onClick={() => onPageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm"
//       >
//         Previous
//       </button>
//       <div className="flex items-center gap-2">
//         {currentPage > 3 && <span className="px-2">...</span>}
//         {pagesAroundCurrent.map((page) => (
//           <button
//             key={page}
//             onClick={() => onPageChange(page)}
//             className={`px-4 py-2 rounded ${
//               currentPage === page
//                 ? "bg-brand-500 text-white"
//                 : "text-gray-700 dark:text-gray-400"
//             } flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500`}
//           >
//             {page}
//           </button>
//         ))}
//         {currentPage < totalPages - 2 && <span className="px-2">...</span>}
//       </div>
//       <button
//         onClick={() => onPageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         className="ml-2.5 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 h-10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
//       >
//         Next
//       </button>
//     </div>
//   );
// };

// export default Pagination;

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
}) => {
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / itemsPerPage)
  );

  // Clamp current page (extra safety)
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startPage = Math.max(1, safeCurrentPage - 1);
  const endPage = Math.min(totalPages, startPage + 2);

  const pagesAroundCurrent = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="flex items-center">
      <button
        onClick={() => onPageChange(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
        className="mr-2.5 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
      >
        Previous
      </button>

      <div className="flex items-center gap-2">
        {startPage > 1 && <span className="px-2">...</span>}

        {pagesAroundCurrent.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium
              ${
                safeCurrentPage === page
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-700 hover:bg-blue-500/[0.08] hover:text-brand-500 dark:text-gray-400'
              }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && <span className="px-2">...</span>}
      </div>

      <button
        onClick={() => onPageChange(safeCurrentPage + 1)}
        disabled={safeCurrentPage === totalPages}
        className="ml-2.5 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;

