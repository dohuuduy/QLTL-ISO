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
        <div className="flex items-center justify-between bg-white/50 dark:bg-stone-800/30 px-4 py-3 sm:px-6 rounded-b-xl border-t border-stone-200 dark:border-stone-700">
            {/* Mobile View */}
            <div className="flex flex-1 justify-between sm:hidden">
                {showPaginationControls ? (
                    <>
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-600 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-600 disabled:opacity-50"
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
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-stone-400 dark:text-stone-400 ring-1 ring-inset ring-stone-300 dark:ring-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
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
                                        ? 'z-10 bg-rose-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600'
                                        : 'text-stone-900 dark:text-stone-200 ring-1 ring-inset ring-stone-300 dark:ring-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 focus:z-20 focus:outline-offset-0'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-stone-400 dark:text-stone-400 ring-1 ring-inset ring-stone-300 dark:ring-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
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