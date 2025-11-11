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
                <div className="border-b border-zinc-200 dark:border-zinc-700">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab, index) => (
                            <button
                                key={tab.title}
                                onClick={() => onTabChange(index)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTabIndex === index
                                        ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                                        : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
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