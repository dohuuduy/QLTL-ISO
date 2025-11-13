



/**
 * WARNING: This file is now mostly UTC-based for internal logic,
 * and GMT+7 based for display logic.
 */
const TIMEZONE = 'Asia/Ho_Chi_Minh'; // GMT+7

/**
 * Formats a Date object into a 'YYYY-MM-DD' string based on its UTC values.
 * This is used for internal state representation and by the UTC-based DatePicker.
 */
export const formatDate = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Gets the month and year text from a Date object based on its UTC values.
 * Used for the DatePicker header.
 */
export const getMonthYearText = (date: Date): string => {
    const month = date.toLocaleString('vi-VN', { month: 'long', timeZone: 'UTC' });
    const year = date.getUTCFullYear();
    return `${month} ${year}`;
};

/**
 * Generates a 6x7 calendar grid for a given month, based on UTC dates.
 * Used by the DatePicker.
 */
export const getCalendarGrid = (displayDate: Date) => {
    const year = displayDate.getUTCFullYear();
    const month = displayDate.getUTCMonth();

    const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay(); // 0=Sun, 1=Mon...
    const daysInLastMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    
    const grid: Date[] = [];

    // Previous month's padding
    for (let i = firstDayOfMonth; i > 0; i--) {
        grid.push(new Date(Date.UTC(year, month - 1, daysInLastMonth - i + 1)));
    }

    // Current month's days
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    for (let i = 1; i <= daysInMonth; i++) {
        grid.push(new Date(Date.UTC(year, month, i)));
    }

    // Next month's padding
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
        grid.push(new Date(Date.UTC(year, month + 1, i)));
    }
    
    // Chunk into weeks
    const weeks: Date[][] = [];
    for (let i = 0; i < grid.length; i += 7) {
        weeks.push(grid.slice(i, i+7));
    }

    return weeks;
}

/**
 * Formats a date string or object for display in dd/MM/yyyy format, in GMT+7 timezone.
 */
export const formatDateForDisplay = (dateInput?: string | Date): string => {
    if (!dateInput) return '';
    try {
        let date: Date;
        if (typeof dateInput === 'string') {
            // Robustly handle 'YYYY-MM-DD' by treating it as a UTC date to avoid browser inconsistencies.
            const safeDateStr = dateInput.includes('T') ? dateInput : `${dateInput}T00:00:00Z`;
            date = new Date(safeDateStr);
        } else {
            date = dateInput;
        }

        if (isNaN(date.getTime())) return '';
        
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: TIMEZONE,
        }).format(date);
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


/**
 * Formats a datetime string or object for display in dd/MM/yyyy HH:mm:ss format, in GMT+7 timezone.
 */
export const formatDateTimeForDisplay = (dateInput?: string | Date): string => {
    if (!dateInput) return '';
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(date.getTime())) return '';

        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: TIMEZONE,
        }).format(date).replace(',', '');
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