import React from 'react';
import type { NhanSu } from '../types';

interface PrintReportLayoutProps {
    title: string;
    filters: Record<string, string>;
    columns: { header: string; accessor: (item: any) => React.ReactNode }[];
    data: any[];
    currentUser: NhanSu;
}

const PrintReportLayout: React.FC<PrintReportLayoutProps> = ({ title, filters, columns, data, currentUser }) => {
    const today = new Date();
    const formattedDate = `ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

    return (
        <div className="print-only print-report-container">
            <header className="header">
                <table style={{ width: '100%', border: 'none' }}>
                    <tbody>
                        <tr>
                            <td style={{ textAlign: 'left', border: 'none', verticalAlign: 'top', width: '40%' }}>
                                <div className="company">CTY CP THỦY SẢN CÀ MAU</div>
                            </td>
                            <td style={{ textAlign: 'center', border: 'none', verticalAlign: 'top' }}>
                                <div className="nation">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                                <div className="motto">Độc lập - Tự do - Hạnh phúc</div>
                                <div>––––––––––––––––––––––––</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </header>

            <h1 className="report-title">{title}</h1>

            <section className="filter-section">
                {Object.entries(filters).map(([key, value]) =>
                    value && value !== 'N/A' && <div key={key}><b>{key}:</b> {value}</div>
                )}
                <div><b>Người lập:</b> {currentUser.ten}</div>
            </section>

            <main>
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            {columns.map((col, index) => (
                                <th key={index}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex}>{col.accessor(item)}</td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ textAlign: 'center' }}>
                                    Không có dữ liệu.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </main>

            <footer className="footer">
                <i>Cà Mau, {formattedDate}</i>
            </footer>

            <section className="signature">
                <div className="sign-title">Người lập báo cáo</div>
                <div className="sign-note"><i>(Ký và ghi rõ họ tên)</i></div>
                <div className="sign-name">{currentUser.ten}</div>
            </section>
        </div>
    );
};

export default PrintReportLayout;