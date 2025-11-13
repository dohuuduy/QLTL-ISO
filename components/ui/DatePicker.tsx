import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Icon } from './Icon';
import { getCalendarGrid, getMonthYearText, formatDate, formatDateForDisplay, parseDisplayDate } from '../../utils/dateUtils';

interface DatePickerProps {
    value: string | undefined;
    onChange: (value: string) => void;
    id?: string;
    required?: boolean;
    className?: string;
}

const CALENDAR_WIDTH = 320; // w-80
const CALENDAR_HEIGHT = 350; // approximate
const CALENDAR_PADDING = 8; // 8px margin from viewport edges

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, id, required, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayValue, setDisplayValue] = useState(formatDateForDisplay(value));
    const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

    let initialDate = value ? new Date(`${value}T00:00:00Z`) : new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    if (isNaN(initialDate.getTime())) initialDate = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    const [displayDate, setDisplayDate] = useState(initialDate);

    const wrapperRef = useRef<HTMLDivElement | null>(null); // wrapper around input
    const calendarRef = useRef<HTMLDivElement | null>(null); // calendar DOM node
    const [calendarStyle, setCalendarStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

    // Sync when external value changes
    useEffect(() => {
        setDisplayValue(formatDateForDisplay(value));
        const newDate = value ? new Date(`${value}T00:00:00Z`) : null;
        if (newDate && !isNaN(newDate.getTime())) setDisplayDate(newDate);
    }, [value]);

    // Close on outside click (works with portal)
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            const target = e.target as Node;
            if (
                wrapperRef.current && wrapperRef.current.contains(target)
            ) {
                return;
            }
            if (calendarRef.current && calendarRef.current.contains(target)) {
                return;
            }
            setIsOpen(false);
        }
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    // Recompute calendar position when open, on resize/scroll
    useEffect(() => {
        if (!isOpen) {
            setCalendarStyle({ visibility: 'hidden' });
            return;
        }

        const updatePosition = () => {
            if (!wrapperRef.current) return;
            const rect = wrapperRef.current.getBoundingClientRect();
            const viewportWidth = document.documentElement.clientWidth;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

            // Preferred left is rect.left
            let left = rect.left;
            // If overflow right, try align right
            if (left + CALENDAR_WIDTH + CALENDAR_PADDING > viewportWidth) {
                left = Math.max(CALENDAR_PADDING, rect.right - CALENDAR_WIDTH);
            }
            // Ensure left not negative
            left = Math.max(CALENDAR_PADDING, left);

            // Preferred below (top)
            let top = rect.bottom;
            let opensUp = false;

            // If not enough space below, open upward
            if (rect.bottom + CALENDAR_HEIGHT + CALENDAR_PADDING > viewportHeight && rect.top - CALENDAR_HEIGHT - CALENDAR_PADDING > 0) {
                // open upward
                top = rect.top - CALENDAR_HEIGHT;
                opensUp = true;
            } else {
                // If still overflow below, clamp height (we'll allow internal scroll)
                if (rect.bottom + CALENDAR_PADDING > viewportHeight) {
                    // make top so calendar bottoms at viewport - padding
                    top = Math.max(CALENDAR_PADDING, viewportHeight - CALENDAR_HEIGHT - CALENDAR_PADDING);
                }
            }

            // Convert to page coordinates (account for scrollY)
            const scrollY = window.scrollY || window.pageYOffset;
            const scrollX = window.scrollX || window.pageXOffset;

            setCalendarStyle({
                position: 'absolute',
                left: `${left + scrollX}px`,
                top: `${top + scrollY}px`,
                width: `${CALENDAR_WIDTH}px`,
                maxHeight: `${CALENDAR_HEIGHT}px`,
                overflow: 'visible',
                zIndex: 9999,
                visibility: 'visible',
            });

            // optional: set transform origin for animation (not required)
            if (calendarRef.current) {
                calendarRef.current.style.transformOrigin = opensUp ? 'bottom left' : 'top left';
            }
        };

        // update immediately
        updatePosition();

        // update on resize/scroll
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true); // true to catch scroll on ancestors
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen, displayDate]); // recompute when open or displayDate changes

    const handleOpen = () => {
        setViewMode('days');
        setIsOpen(true);
    };

    const toggleCalendar = () => {
        setIsOpen(prev => !prev);
    };

    const handleDateSelect = (day: Date) => {
        onChange(formatDate(day)); // formatDate is now UTC-based
        setIsOpen(false);
    };

    const handleMonthSelect = (monthIndex: number) => {
        setDisplayDate(new Date(Date.UTC(displayDate.getUTCFullYear(), monthIndex, 1)));
        setViewMode('days');
    };

    const handleYearSelect = (year: number) => {
        setDisplayDate(new Date(Date.UTC(year, displayDate.getUTCMonth(), 1)));
        setViewMode('months');
    };

    const changeDate = (amount: number) => {
        switch (viewMode) {
            case 'days':
                setDisplayDate(prev => {
                    const newDate = new Date(prev);
                    newDate.setUTCMonth(newDate.getUTCMonth() + amount);
                    return newDate;
                });
                break;
            case 'months':
                 setDisplayDate(prev => {
                    const newDate = new Date(prev);
                    newDate.setUTCFullYear(newDate.getUTCFullYear() + amount);
                    return newDate;
                });
                break;
            case 'years':
                setDisplayDate(prev => {
                    const newDate = new Date(prev);
                    newDate.setUTCFullYear(newDate.getUTCFullYear() + amount * 10);
                    return newDate;
                });
                break;
        }
    };

    const handleHeaderClick = () => {
        if (viewMode === 'days') setViewMode('months');
        else if (viewMode === 'months') setViewMode('years');
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
        if (isoDate) onChange(isoDate);
        else setDisplayValue(formatDateForDisplay(value));
    };

    const yearRange = useMemo(() => {
        const year = displayDate.getUTCFullYear();
        const startYear = Math.floor(year / 10) * 10;
        return { start: startYear, end: startYear + 9 };
    }, [displayDate]);

    const renderHeader = () => {
        let text = '';
        switch (viewMode) {
            case 'days': text = getMonthYearText(displayDate); break;
            case 'months': text = displayDate.getUTCFullYear().toString(); break;
            case 'years': text = `${yearRange.start} - ${yearRange.end}`; break;
        }
        return (
            <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => changeDate(-1)} className="p-1 rounded-full hover:bg-gray-100">
                    <Icon type="chevron-left" className="h-5 w-5 text-gray-600" />
                </button>
                <button type="button" onClick={handleHeaderClick} className="flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                    <span>{text}</span>
                    {viewMode !== 'years' && <Icon type="chevron-down" className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => changeDate(1)} className="p-1 rounded-full hover:bg-gray-100">
                    <Icon type="chevron-right" className="h-5 w-5 text-gray-600" />
                </button>
            </div>
        );
    };

    const renderDaysGrid = () => {
        const calendarGrid = getCalendarGrid(displayDate);
        const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        let selectedDateObj = value ? new Date(`${value}T00:00:00Z`) : null;
        if (selectedDateObj && isNaN(selectedDateObj.getTime())) selectedDateObj = null;

        const now = new Date();
        const todayAtUTCMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        return (
            <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
                {weekdays.map(day => (
                    <div key={day} className="w-9 h-9 flex items-center justify-center font-medium text-gray-500">{day}</div>
                ))}
                {calendarGrid.flat().map((day, index) => {
                    if (!day) return <div key={index}></div>;

                    const isCurrentMonthDay = day.getUTCMonth() === displayDate.getUTCMonth();
                    const isSelected = selectedDateObj && day.getTime() === selectedDateObj.getTime();
                    const isToday = day.getTime() === todayAtUTCMidnight.getTime();

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
                                {day.getUTCDate()}
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderMonthsGrid = () => {
        const months = [...Array(12).keys()];
        const currentMonth = displayDate.getUTCMonth();
        return (
            <div className="grid grid-cols-4 gap-2">
                {months.map(monthIndex => {
                    const monthName = new Date(Date.UTC(2000, monthIndex)).toLocaleString('vi-VN', { month: 'short', timeZone: 'UTC' });
                    return (
                        <button
                            key={monthIndex}
                            type="button"
                            onClick={() => handleMonthSelect(monthIndex)}
                            className={`w-16 h-12 flex items-center justify-center rounded-md text-sm transition-colors
                                ${monthIndex === currentMonth ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-gray-100 text-gray-800'}
                            `}
                        >
                            {monthName}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderYearsGrid = () => {
        const currentYear = displayDate.getUTCFullYear();
        const years = Array.from({ length: 12 }, (_, i) => yearRange.start - 1 + i);
        return (
            <div className="grid grid-cols-4 gap-2">
                {years.map(year => {
                    const isCurrentDecade = year >= yearRange.start && year <= yearRange.end;
                    return (
                        <button
                            key={year}
                            type="button"
                            onClick={() => handleYearSelect(year)}
                            className={`w-16 h-12 flex items-center justify-center rounded-md text-sm transition-colors
                                ${year === currentYear ? 'bg-blue-600 text-white font-semibold' : ''}
                                ${year !== currentYear && isCurrentDecade ? 'hover:bg-gray-100 text-gray-800' : ''}
                                ${!isCurrentDecade ? 'text-gray-400 hover:bg-gray-100' : ''}
                            `}
                        >
                            {year}
                        </button>
                    );
                })}
            </div>
        );
    };

    // calendar element (rendered into body via portal)
    const calendarElement = (
        <div
            ref={calendarRef}
            style={calendarStyle}
            className="rounded-md bg-white shadow-lg border border-gray-200 p-4"
            role="dialog"
            aria-modal="true"
        >
            {/* header */}
            {renderHeader()}
            {/* body with constrained height and internal scroll */}
            <div style={{ maxHeight: CALENDAR_HEIGHT - 60, overflowY: 'auto' }}>
                {viewMode === 'days' && renderDaysGrid()}
                {viewMode === 'months' && renderMonthsGrid()}
                {viewMode === 'years' && renderYearsGrid()}
            </div>
        </div>
    );

    return (
        <>
            <div ref={wrapperRef} className="relative">
                <div className="relative">
                    <input
                        type="text"
                        id={id}
                        value={displayValue}
                        onFocus={handleOpen}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        required={required}
                        className={`form-input pr-10 ${className || ''}`}
                        placeholder="dd/MM/yyyy"
                        autoComplete="off"
                    />
                    <input type="hidden" name={id} value={value || ''} />
                    <button
                        type="button"
                        onClick={toggleCalendar}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                        aria-label="Toggle calendar"
                    >
                        <Icon type="calendar" className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {isOpen && ReactDOM.createPortal(calendarElement, document.body)}
        </>
    );
};

export default DatePicker;