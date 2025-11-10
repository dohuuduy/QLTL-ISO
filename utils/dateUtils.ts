

export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const getMonthYearText = (date: Date): string => {
    const month = date.toLocaleString('vi-VN', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${year}`;
};

export const getCalendarGrid = (displayDate: Date) => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInLastMonth = new Date(year, month, 0).getDate();
    
    const grid: Date[] = [];

    // Previous month's padding
    for (let i = firstDayOfMonth; i > 0; i--) {
        grid.push(new Date(year, month - 1, daysInLastMonth - i + 1));
    }

    // Current month's days
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        grid.push(new Date(year, month, i));
    }

    // Next month's padding
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
        grid.push(new Date(year, month + 1, i));
    }
    
    // Chunk into weeks
    const weeks: Date[][] = [];
    for (let i = 0; i < grid.length; i += 7) {
        weeks.push(grid.slice(i, i+7));
    }

    return weeks;
}

export const formatDateForDisplay = (isoDate?: string): string => {
    if (!isoDate) return '';
    try {
        // Using UTC methods to avoid timezone issues. The input is 'YYYY-MM-DD'.
        const parts = isoDate.split('T')[0].split('-');
        if (parts.length !== 3) return '';
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        
        const date = new Date(Date.UTC(year, month - 1, day));
        if (isNaN(date.getTime())) return '';

        const displayDay = String(date.getUTCDate()).padStart(2, '0');
        const displayMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
        const displayYear = date.getUTCFullYear();
        return `${displayDay}/${displayMonth}/${displayYear}`;
    } catch (e) {
        return '';
    }
};

/**
 * Parses a date string in dd/MM/yyyy format and returns an ISO string (yyyy-MM-dd).
 * Returns null if the format is invalid.
 */
export const parseDisplayDate = (displayDate?: string): string | null => {
    if (!displayDate) return null;

    // Regex to match d/m/yyyy or dd/mm/yyyy, allowing for single digits and separators /, -, .
    const match = displayDate.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
    if (!match) return null;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // Basic sanity checks for year and month
    if (year < 1000 || year > 3000 || month < 1 || month > 12) {
        return null;
    }

    const date = new Date(Date.UTC(year, month - 1, day));

    // Check if the constructed date is valid and its parts match the input.
    // This catches invalid dates like 30/02/2024.
    if (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    ) {
        // Return in ISO format (YYYY-MM-DD)
        return date.toISOString().split('T')[0];
    }

    return null;
};


export const formatDateTimeForDisplay = (isoTimestamp?: string): string => {
    if (!isoTimestamp) return '';
    try {
        const date = new Date(isoTimestamp);
        if (isNaN(date.getTime())) return '';
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
        return '';
    }
};

export const formatRelativeTime = (isoString: string): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
        const diffInDays = diffInSeconds / (60 * 60 * 24);

        if (diffInDays < 1 && now.getDate() === date.getDate()) {
            return 'hôm nay';
        }
        if (diffInDays < 2 && now.getDate() - 1 === date.getDate()) {
            return 'hôm qua';
        }
        if (diffInDays < 7) {
            return `${Math.floor(diffInDays)} ngày trước`;
        }
        return formatDateForDisplay(isoString);
    } catch (e) {
        return '';
    }
};