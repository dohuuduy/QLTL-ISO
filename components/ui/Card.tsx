import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

interface CardSubComponents {
    Header: React.FC<{ children: React.ReactNode; className?: string }>;
    Body: React.FC<{ children: React.ReactNode; className?: string }>;
    Footer: React.FC<{ children: React.ReactNode; className?: string }>;
}

const Card: React.FC<CardProps> & CardSubComponents = ({ children, className = '' }) => {
    return (
        <div className={`bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm shadow-md border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl ${className}`}>
            {children}
        </div>
    );
};

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return <div className={`px-4 py-4 sm:px-6 border-b border-zinc-200/80 dark:border-zinc-700/80 ${className}`}>{children}</div>;
};

const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
};

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return <div className={`px-4 py-4 sm:px-6 bg-zinc-50/80 dark:bg-zinc-800/40 border-t border-zinc-200/80 dark:border-zinc-700/80 rounded-b-xl ${className}`}>{children}</div>;
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;