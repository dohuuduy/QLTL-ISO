/**
 * Escapes a value for use in a CSV file.
 * If the value contains a comma, newline, or double quote, it will be wrapped in double quotes.
 * Existing double quotes will be escaped by doubling them.
 * @param value The value to escape.
 * @returns The escaped value as a string.
 */
const escapeCsvValue = (value: any): string => {
    const stringValue = String(value ?? ''); // Handle null/undefined
    if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};


/**
 * Exports an array of objects to a CSV file.
 * @param data An array of objects to export.
 * @param headers An object mapping object keys to CSV header names.
 * @param filename The name of the file to download.
 */
export const exportToCsv = (data: any[], headers: { [key: string]: string }, filename: string) => {
    const headerKeys = Object.keys(headers);
    const headerValues = Object.values(headers);

    const csvRows = [
        headerValues.map(escapeCsvValue).join(','), // Header row
    ];

    data.forEach(item => {
        const row = headerKeys.map(key => escapeCsvValue(item[key]));
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' }); // \uFEFF is the UTF-8 BOM

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

interface ReportExportOptions {
    filename: string;
    reportTitle: string;
    filtersApplied: { label: string; value: string }[];
    summaryData?: any[];
    summaryHeaders?: { [key: string]: string };
    detailData: any[];
    detailHeaders: { [key: string]: string };
}

/**
 * Exports a structured report to a CSV file, including title, filters, summary, and details.
 * @param options The configuration for the report export.
 */
export const exportReportToCsv = (options: ReportExportOptions) => {
    const { 
        filename, 
        reportTitle, 
        filtersApplied, 
        summaryData, 
        summaryHeaders, 
        detailData, 
        detailHeaders 
    } = options;

    const csvRows: string[] = [];

    // Report Title
    csvRows.push(escapeCsvValue(reportTitle));
    csvRows.push(`"Ngày xuất: ${new Date().toLocaleString('vi-VN')}"`);
    csvRows.push('');

    // Applied Filters
    if (filtersApplied.length > 0) {
        csvRows.push(escapeCsvValue('Điều kiện lọc đã áp dụng'));
        filtersApplied.forEach(filter => {
            csvRows.push(`${escapeCsvValue(filter.label)},${escapeCsvValue(filter.value)}`);
        });
        csvRows.push('');
    }

    // Summary Data
    if (summaryData && summaryHeaders && summaryData.length > 0) {
        csvRows.push(escapeCsvValue('Bảng Tóm tắt'));
        const summaryHeaderKeys = Object.keys(summaryHeaders);
        const summaryHeaderValues = Object.values(summaryHeaders);
        csvRows.push(summaryHeaderValues.map(escapeCsvValue).join(','));
        summaryData.forEach(item => {
            const row = summaryHeaderKeys.map(key => escapeCsvValue(item[key]));
            csvRows.push(row.join(','));
        });
        csvRows.push('');
        csvRows.push('');
    }

    // Detail Data
    csvRows.push(escapeCsvValue('Dữ liệu Chi tiết'));
    const detailHeaderKeys = Object.keys(detailHeaders);
    const detailHeaderValues = Object.values(detailHeaders);
    csvRows.push(detailHeaderValues.map(escapeCsvValue).join(','));
    detailData.forEach(item => {
        const row = detailHeaderKeys.map(key => escapeCsvValue(item[key]));
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
