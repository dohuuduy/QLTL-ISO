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


/**
 * Exports the content of the hidden print layout to a Word (.doc) file.
 * @param filename The name of the file to download (without extension).
 */
export const exportVisibleReportToWord = (filename: string) => {
    const source = document.querySelector('.print-only.print-report-container');
    if (!source) {
        alert("Không tìm thấy nội dung báo cáo để xuất. Vui lòng chọn bộ lọc để tạo báo cáo trước.");
        return;
    }

    // Inline the print styles to ensure Word formats the document correctly.
    const styles = `
        <style>
            .print-report-container { font-family: "Times New Roman", Times, serif; line-height: 1.5; color: #000; }
            .header { text-align: center; margin-bottom: 20px; }
            .header table, .header tr, .header td { border: none !important; }
            .header .company { font-weight: bold; text-transform: uppercase; text-align: left; vertical-align: top; }
            .header .nation { font-weight: bold; text-transform: uppercase; text-align: center; }
            .header .motto { font-style: italic; font-weight: bold; text-align: center; }
            .report-title { text-align: center; font-weight: bold; font-size: 16pt; text-transform: uppercase; margin: 30px 0 15px; }
            .filter-section { margin: 15px 0; font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11pt; }
            th, td { border: 1px solid black !important; padding: 6px 8px; text-align: left; }
            th { text-align: center; font-weight: bold; }
            .footer { margin-top: 30px; text-align: right; }
            .signature { margin-top: 10px; text-align: center; width: 35%; margin-left: auto; }
            .sign-title { font-weight: bold; text-transform: uppercase; }
            .sign-note { font-style: italic; margin-top: 5px; }
            .sign-name { margin-top: 60px; font-weight: bold; }
        </style>
    `;

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
        "xmlns:w='urn:schemas-microsoft-com:office:word' "+
        "xmlns='http://www.w3.org/TR/REC-html40'>"+
        "<head><meta charset='utf-8'><title>Word Export</title>" + styles + "</head><body>";
    
    const footer = "</body></html>";
    
    const sourceHtml = source.innerHTML;
    const fullHtml = header + sourceHtml + footer;

    const blob = new Blob(['\ufeff', fullHtml], {
        type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};