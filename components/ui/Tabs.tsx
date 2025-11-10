

import React from 'react';

interface Tab {
    title: string;
    content: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    activeTabIndex: number;
    onTabChange: (index: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTabIndex, onTabChange }) => {
    return (
        <div>
            <div className="tab-nav">
                <div className="sm:hidden">
                    <label htmlFor="tabs" className="sr-only">Select a tab</label>
                    <select
                        id="tabs"
                        name="tabs"
                        className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={activeTabIndex}
                        onChange={(e) => onTabChange(parseInt(e.target.value, 10))}
                    >
                        {tabs.map((tab, index) => (
                            <option key={tab.title} value={index}>{tab.title}</option>
                        ))}
                    </select>
                </div>
                <div className="hidden sm:block">
                    <div className="border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <nav className="-mb-px flex space-x-8 px-4 sm:px-6" aria-label="Tabs">
                                {tabs.map((tab, index) => (
                                    <button
                                        key={tab.title}
                                        onClick={() => onTabChange(index)}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTabIndex === index
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab.title}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-0">
                {tabs.map((tab, index) => (
                     <div
                        key={tab.title}
                        className={`tab-content ${activeTabIndex === index ? '' : 'hidden'}`}
                    >
                        <h4 className="text-xl font-bold mb-4 hidden print:block border-b pb-2">{tab.title}</h4>
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tabs;