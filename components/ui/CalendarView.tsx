import React, { useMemo } from 'react';
import { Icon } from './Icon';
import { getMonthYearText, getCalendarGrid } from '../../utils/dateUtils';
import type { LichAudit } from '../../types';

interface CalendarEvent {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    data: LichAudit;
}

interface CalendarViewProps {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    events: CalendarEvent[];
    onEventClick: (event: LichAudit) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, setCurrentDate, events, onEventClick }) => {
    const calendarGrid = useMemo(() => getCalendarGrid(currentDate), [currentDate]);
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const changeMonth = (amount: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1));
    };

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        events.forEach(event => {
            let d = new Date(event.startDate);
            // Loop through each day of the event
            while (d <= event.endDate) {
                const dateString = d.toISOString().split('T')[0];
                if (!map.has(dateString)) {
                    map.set(dateString, []);
                }
                map.get(dateString)!.push(event);
                d.setDate(d.getDate() + 1);
            }
        });
        return map;
    }, [events]);

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Icon type="chevron-left" className="h-6 w-6 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                    {getMonthYearText(currentDate)}
                </h2>
                <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Icon type="chevron-right" className="h-6 w-6 text-gray-600" />
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {weekdays.map(day => (
                    <div key={day} className="py-2 text-center text-sm font-semibold text-gray-600 bg-slate-50">{day}</div>
                ))}

                {calendarGrid.flat().map((day, index) => {
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = day.getTime() === today.getTime();
                    const dateString = day.toISOString().split('T')[0];
                    const dayEvents = eventsByDate.get(dateString) || [];

                    return (
                        <div key={index} className={`min-h-[120px] p-1.5 bg-white overflow-hidden ${isCurrentMonth ? '' : 'bg-slate-50'}`}>
                            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm
                                ${isToday ? 'bg-blue-600 text-white font-bold' : ''}
                                ${!isToday && isCurrentMonth ? 'text-gray-800' : ''}
                                ${!isCurrentMonth ? 'text-gray-400' : ''}
                            `}>
                                {day.getDate()}
                            </div>
                            <div className="mt-1 space-y-1 h-[85px] overflow-y-auto">
                                {dayEvents.map(event => (
                                    <button 
                                        key={event.id}
                                        onClick={() => onEventClick(event.data)}
                                        className={`w-full text-left p-1 rounded-md text-xs font-medium truncate transition-colors
                                            ${event.data.loai_audit === 'internal' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}
                                        `}
                                        title={event.title}
                                    >
                                        {event.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
