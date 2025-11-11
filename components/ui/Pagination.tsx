import React from 'react';
import { Icon } from './Icon';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    children?: React.ReactNode;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, children }) => {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }
    
    const showPaginationControls = totalPages > 1;

    return (
        <div className="flex items-center justify-between bg-white/50 dark:bg-zinc-800/30 px-4 py-3 sm:px-6 rounded-b-xl border-t border-zinc-200 dark:border-zinc-700">
            {/* Mobile View */}
            <div className="flex flex-1 justify-between sm:hidden">
                {showPaginationControls ? (
                    <>
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-600 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-600 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </>
                ) : <div />}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    {children}
                </div>
                {showPaginationControls && (
                     <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={handlePrevious}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-zinc-400 dark:text-zinc-400 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                                <span className="sr-only">Previous</span>
                                <Icon type="chevron-left" className="h-5 w-5" />
                            </button>
                            
                            {pageNumbers.map(page => (
                                 <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                        currentPage === page 
                                        ? 'z-10 bg-teal-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600'
                                        : 'text-zinc-900 dark:text-zinc-200 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:z-20 focus:outline-offset-0'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-zinc-400 dark:text-zinc-400 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                                <span className="sr-only">Next</span>
                                 <Icon type="chevron-right" className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pagination;