import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

interface ExportDropdownProps {
    onPrint: () => void;
    onExportCsv: () => void;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ onPrint, onExportCsv }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);
    
    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative inline-block text-left">
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    id="menu-button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                >
                    Xuất & In
                    <Icon type="chevron-down" className="-mr-1 h-5 w-5 text-gray-400" />
                </button>
            </div>

            {isOpen && (
                <div
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    <div className="py-1" role="none">
                        <a href="#" onClick={(e) => { e.preventDefault(); handleAction(onPrint); }} className="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">
                            <Icon type="printer" className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            In danh sách
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleAction(onExportCsv); }} className="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">
                           <Icon type="document-arrow-down" className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                           Xuất ra CSV (Excel)
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportDropdown;
