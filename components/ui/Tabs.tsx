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
                <div className="border-b border-stone-200 dark:border-stone-700">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab, index) => (
                            <button
                                key={tab.title}
                                onClick={() => onTabChange(index)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTabIndex === index
                                        ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                                        : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
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
            <div className="hidden print-only">
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