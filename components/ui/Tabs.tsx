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
            {/* Screen view: Interactive tabs */}
            <div className="no-print">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab, index) => (
                            <button
                                key={tab.title}
                                onClick={() => onTabChange(index)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTabIndex === index
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                                aria-current={activeTabIndex === index ? 'page' : undefined}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </nav>
                </div>
                <div>
                    {tabs.length > 0 && tabs[activeTabIndex] ? tabs[activeTabIndex].content : null}
                </div>
            </div>

            {/* Print view: All tabs are rendered sequentially */}
            <div className="hidden print-block">
                {tabs.map((tab, index) => (
                    <div key={index}>
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tabs;
