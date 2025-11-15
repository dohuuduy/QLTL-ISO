import React from 'react';
import { Icon } from './Icon';

interface TogglePillGroupProps<T extends string> {
    label: string;
    options: { id: T; label: string }[];
    selectedOptions: T[];
    onChange: (newSelectedOptions: T[]) => void;
}

const TogglePillGroup = <T extends string>({ label, options, selectedOptions, onChange }: TogglePillGroupProps<T>) => {
    
    const handleToggle = (optionId: T) => {
        const isSelected = selectedOptions.includes(optionId);
        let newSelectedOptions: T[];

        if (isSelected) {
            newSelectedOptions = selectedOptions.filter(id => id !== optionId);
        } else {
            newSelectedOptions = [...selectedOptions, optionId];
        }
        onChange(newSelectedOptions);
    };

    return (
        <div role="group" aria-label={label}>
            <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
            <div className="flex flex-wrap gap-2">
                {options.map(option => {
                    const isSelected = selectedOptions.includes(option.id);
                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => handleToggle(option.id)}
                            className="toggle-pill"
                            aria-pressed={isSelected}
                        >
                            <Icon type="check-circle" className="pill-icon h-4 w-4" />
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TogglePillGroup;