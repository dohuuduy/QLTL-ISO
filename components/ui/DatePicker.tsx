import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { getCalendarGrid, getMonthYearText, formatDate, formatDateForDisplay, parseDisplayDate } from '../../utils/dateUtils';

interface DatePickerProps {
    value: string | undefined;
    onChange: (value: string) => void;
    id?: string;
    required?: boolean;
    className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, id, required, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayValue, setDisplayValue] = useState(formatDateForDisplay(value));

    let initialDate = value ? new Date(`${value}T00:00:00Z`) : new Date();
    if (isNaN(initialDate.getTime())) {
      initialDate = new Date();
    }
    
    const [displayDate, setDisplayDate] = useState(initialDate);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync display value when the external value prop changes
    useEffect(() => {
        setDisplayValue(formatDateForDisplay(value));
        const newDate = value ? new Date(`${value}T00:00:00Z`) : null;
        if (newDate && !isNaN(newDate.getTime())) {
            setDisplayDate(newDate);
        }
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleDateSelect = (day: Date) => {
        onChange(formatDate(day));
        setIsOpen(false);
    };

    const changeMonth = (amount: number) => {
        setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayValue(e.target.value);
    };

    const handleInputBlur = () => {
        if (displayValue === '') {
            onChange('');
            return;
        }

        const isoDate = parseDisplayDate(displayValue);
        if (isoDate) {
            // Valid manual input, update parent state
            onChange(isoDate);
        } else {
            // Invalid manual input, revert to last known good value
            setDisplayValue(formatDateForDisplay(value));
        }
    };
    
    const calendarGrid = getCalendarGrid(displayDate);
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    let selectedDateObj = value ? new Date(`${value}T00:00:00Z`) : null; // Use UTC to avoid timezone shifts
    if (selectedDateObj && isNaN(selectedDateObj.getTime())) {
      selectedDateObj = null;
    }

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <input
                    type="text"
                    id={id}
                    value={displayValue}
                    onFocus={() => setIsOpen(true)}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    required={required}
                    className={`${className} pr-10`}
                    placeholder="dd/MM/yyyy"
                />
                 {/* The hidden input ensures form submission works as expected with the name attribute */}
                <input type="hidden" name={id} value={value || ''} />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    aria-label="Toggle calendar"
                >
                    <Icon type="calendar" className="h-5 w-5" />
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-20 mt-1 w-80 rounded-md bg-white shadow-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100">
                             <Icon type="chevron-left" className="h-5 w-5 text-gray-600" />
                        </button>
                        <span className="text-sm font-semibold text-gray-800">{getMonthYearText(displayDate)}</span>
                        <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100">
                             <Icon type="chevron-right" className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
                        {weekdays.map(day => (
                            <div key={day} className="w-9 h-9 flex items-center justify-center font-medium text-gray-500">{day}</div>
                        ))}
                        {calendarGrid.flat().map((day, index) => {
                            if (!day) return <div key={index}></div>;
                            
                            const isCurrentMonthDay = day.getMonth() === displayDate.getMonth();
                            // Compare dates by ignoring time part
                            const isSelected = selectedDateObj && day.toDateString() === selectedDateObj.toDateString();
                            const isToday = day.toDateString() === new Date().toDateString();

                            return (
                                <div key={index} className="py-1 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => handleDateSelect(day)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors
                                            ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                                            ${!isSelected && isToday ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                                            ${!isSelected && !isToday && isCurrentMonthDay ? 'hover:bg-gray-100 text-gray-800' : ''}
                                            ${!isCurrentMonthDay ? 'text-gray-400 hover:bg-gray-100' : ''}
                                        `}
                                    >
                                        {day.getDate()}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;