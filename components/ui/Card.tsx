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
        <div className={`bg-white shadow border border-slate-200 rounded-xl transition-shadow duration-200 hover:shadow-md ${className}`}>
            {children}
        </div>
    );
};

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return <div className={`px-4 py-4 sm:px-6 border-b border-slate-200 ${className}`}>{children}</div>;
};

const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
};

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return <div className={`px-4 py-4 sm:px-6 bg-slate-50/75 border-t border-slate-200 rounded-b-xl ${className}`}>{children}</div>;
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;