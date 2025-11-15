import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { DanhMucTaiLieu, NhanSu, PhongBan, LoaiTaiLieu, CapDoTaiLieu, MucDoBaoMat, TieuChuan } from '../../types';
import { DocumentStatus } from '../../constants';
import DatePicker from '../ui/DatePicker';
import { Icon } from '../ui/Icon';

interface DocumentFormProps {
    id: string; // Form ID for external submission
    onSubmit: (data: DanhMucTaiLieu) => void;
    initialData?: DanhMucTaiLieu | null;
    documents: DanhMucTaiLieu[]; // Pass all documents to select a parent
    categories: {
        nhanSu: NhanSu[];
        phongBan: PhongBan[];
        loaiTaiLieu: LoaiTaiLieu[];
        capDoTaiLieu: CapDoTaiLieu[];
        mucDoBaoMat: MucDoBaoMat[];
        tieuChuan: TieuChuan[];
    };
}

// Helper function to find all descendants of a document using Breadth-First Search
const getDescendantIds = (docId: string, allDocs: DanhMucTaiLieu[]): Set<string> => {
    const descendants = new Set<string>();
    const queue: string[] = [];

    // Start traversal with direct children
    for (const doc of allDocs) {
        if (doc.ma_tl_cha === docId) {
            descendants.add(doc.ma_tl);
            queue.push(doc.ma_tl);
        }
    }

    let head = 0;
    while (head < queue.length) {
        const currentParentId = queue[head];
        head++;
        
        // Find children of the current node and add them to the queue
        for (const doc of allDocs) {
            if (doc.ma_tl_cha === currentParentId) {
                if (!descendants.has(doc.ma_tl)) {
                    descendants.add(doc.ma_tl);
                    queue.push(doc.ma_tl);
                }
            }
        }
    }

    return descendants;
};


const DocumentForm: React.FC<DocumentFormProps> = ({ id, onSubmit, initialData, documents, categories }) => {
    const getInitialState = (): Omit<DanhMucTaiLieu, 'ma_tl'> => ({
        ten_tai_lieu: '',
        so_hieu: '',
        loai_tai_lieu: '',
        cap_do: '',
        pham_vi_ap_dung: [],
        phong_ban_quan_ly: '',
        trang_thai: DocumentStatus.NHAP,
        muc_do_bao_mat: '',
        tieu_chuan_ids: [],
        iso_tham_chieu: [],
        tieu_chuan_khac: [],
        phap_ly_tham_chieu: [],
        ngay_ban_hanh: new Date().toISOString().split('T')[0],
        ngay_hieu_luc: new Date().toISOString().split('T')[0],
        ngay_het_hieu_luc: undefined,
        mo_ta_tom_tat: '',
        nguoi_soan_thao: '',
        nguoi_ra_soat: '',
        nguoi_phe_duyet: '',
        file_pdf: '',
        file_docx: '',
        link_drive: '',
        tai_lieu_thay_the: '',
        ma_tl_cha: undefined,
    });

    const [activeTab, setActiveTab] = useState<'basic' | 'references'>('basic');
    const [formData, setFormData] = useState(getInitialState());
    const [dateError, setDateError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const [isStandardsDropdownOpen, setIsStandardsDropdownOpen] = useState(false);
    const [standardsSearchTerm, setStandardsSearchTerm] = useState('');
    const standardsDropdownRef = useRef<HTMLDivElement>(null);

    const [isIsoRefDropdownOpen, setIsIsoRefDropdownOpen] = useState(false);
    const [isoRefSearchTerm, setIsoRefSearchTerm] = useState('');
    const isoRefDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...getInitialState(),
                ...initialData
            });
        } else {
            setFormData(getInitialState());
        }
        setErrors({}); // Clear errors when initial data changes
    }, [initialData]);

    useEffect(() => {
        const effectiveDate = formData.ngay_hieu_luc ? new Date(formData.ngay_hieu_luc) : null;
        const expiryDate = formData.ngay_het_hieu_luc ? new Date(formData.ngay_het_hieu_luc) : null;

        if (effectiveDate && expiryDate && expiryDate < effectiveDate) {
            setDateError('Ngày hết hiệu lực không được trước ngày hiệu lực.');
        } else {
            setDateError(null);
        }
    }, [formData.ngay_hieu_luc, formData.ngay_het_hieu_luc]);
    
    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (standardsDropdownRef.current && !standardsDropdownRef.current.contains(event.target as Node)) {
                setIsStandardsDropdownOpen(false);
            }
            if (isoRefDropdownRef.current && !isoRefDropdownRef.current.contains(event.target as Node)) {
                setIsIsoRefDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [standardsDropdownRef, isoRefDropdownRef]);

    const validate = (): Record<string, string> => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.ten_tai_lieu.trim()) newErrors.ten_tai_lieu = "Tên tài liệu là bắt buộc.";
        if (!formData.loai_tai_lieu) newErrors.loai_tai_lieu = "Vui lòng chọn loại tài liệu.";
        if (!formData.phong_ban_quan_ly) newErrors.phong_ban_quan_ly = "Vui lòng chọn phòng ban.";
        if (!formData.cap_do) newErrors.cap_do = "Vui lòng chọn cấp độ.";
        if (!formData.muc_do_bao_mat) newErrors.muc_do_bao_mat = "Vui lòng chọn mức độ bảo mật.";
        if (!formData.nguoi_soan_thao) newErrors.nguoi_soan_thao = "Vui lòng chọn người soạn thảo.";
        if (!formData.nguoi_ra_soat) newErrors.nguoi_ra_soat = "Vui lòng chọn người rà soát.";
        if (!formData.nguoi_phe_duyet) newErrors.nguoi_phe_duyet = "Vui lòng chọn người phê duyệt.";
        if (!formData.ngay_ban_hanh) newErrors.ngay_ban_hanh = "Ngày ban hành là bắt buộc.";
        if (!formData.ngay_hieu_luc) newErrors.ngay_hieu_luc = "Ngày hiệu lực là bắt buộc.";

        return newErrors;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleDateChange = (name: keyof DanhMucTaiLieu, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
         if (errors[name as string]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name as string];
                return newErrors;
            });
        }
    }

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const values = value.split(',').map(s => s.trim()).filter(Boolean);
        setFormData(prev => ({ ...prev, [name]: values }));
    };
    
    const handleSelectStandard = (standardId: string) => {
        setFormData(prev => ({
            ...prev,
            tieu_chuan_ids: [...(prev.tieu_chuan_ids || []), standardId]
        }));
        setStandardsSearchTerm('');
        setIsStandardsDropdownOpen(false);
    };

    const handleRemoveStandard = (standardId: string) => {
        setFormData(prev => ({
            ...prev,
            tieu_chuan_ids: (prev.tieu_chuan_ids || []).filter(id => id !== standardId)
        }));
    };
    
    const handleSelectIsoRef = (standardId: string) => {
        setFormData(prev => ({
            ...prev,
            iso_tham_chieu: [...(prev.iso_tham_chieu || []), standardId]
        }));
        setIsoRefSearchTerm('');
        setIsIsoRefDropdownOpen(false);
    };

    const handleRemoveIsoRef = (standardId: string) => {
        setFormData(prev => ({
            ...prev,
            iso_tham_chieu: (prev.iso_tham_chieu || []).filter(id => id !== standardId)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0 || dateError) {
            // If validation fails on a different tab, switch to it
            const firstErrorKey = Object.keys(validationErrors)[0];
            const referenceFields = ['tieu_chuan_ids', 'iso_tham_chieu', 'tieu_chuan_khac', 'phap_ly_tham_chieu', 'ma_tl_cha', 'link_drive', 'file_pdf', 'file_docx'];
            
            if (firstErrorKey) {
                 if(referenceFields.includes(firstErrorKey) && activeTab !== 'references') {
                    setActiveTab('references');
                } else if (!referenceFields.includes(firstErrorKey) && activeTab !== 'basic') {
                    setActiveTab('basic');
                }
            }
            return;
        }
        onSubmit({
            ...(initialData || { ma_tl: '' }),
            ...formData,
        });
    };
    
    const getLevelNumber = (capDoId: string | undefined): number => {
        if (!capDoId) return Infinity; // A document without a level can have any parent
        const capDoItem = categories.capDoTaiLieu.find(c => c.id === capDoId);
        if (!capDoItem) return Infinity;
        
        // Extract number from "Cấp 1 - Sổ tay chất lượng"
        const match = capDoItem.ten.match(/^Cấp (\d+)/);
        return match ? parseInt(match[1], 10) : Infinity;
    };

    const potentialParentDocuments = useMemo(() => {
        // 1. Prevent circular dependencies: a doc cannot be its own parent or child of its descendants.
        const forbiddenIds = new Set<string>();
        if (initialData?.ma_tl) {
            forbiddenIds.add(initialData.ma_tl);
            const descendantIds = getDescendantIds(initialData.ma_tl, documents);
            descendantIds.forEach(id => forbiddenIds.add(id));
        }
        
        // 2. Filter by document level
        const currentDocLevel = getLevelNumber(formData.cap_do);
        if (currentDocLevel === Infinity) {
             // If current doc has no level set, only apply circular dependency filter
            return documents.filter(doc => !forbiddenIds.has(doc.ma_tl));
        }

        return documents.filter(doc => {
            // Rule 1: Exclude self and descendants
            if (forbiddenIds.has(doc.ma_tl)) {
                return false;
            }

            // Rule 2: Parent's level must be strictly higher (smaller number)
            const parentCandidateLevel = getLevelNumber(doc.cap_do);
            return parentCandidateLevel < currentDocLevel;
        });
    }, [documents, initialData, formData.cap_do]);

    const activeOrCurrentlySelected = (list: any[], selectedIds: string | string[]) => {
        if (Array.isArray(selectedIds)) {
            return list.filter(item => item.is_active !== false || selectedIds.includes(item.id));
        }
        return list.filter(item => item.is_active !== false || item.id === selectedIds);
    };
    
    const getStandardDisplay = (standard: TieuChuan | undefined) => {
        if (!standard) return '';
        const versionPart = standard.phien_ban ? `v${standard.phien_ban}` : '';
        const detailsPart = [standard.ten_viet_tat, versionPart].filter(Boolean).join(' ');
        return detailsPart ? `${standard.ten} (${detailsPart})` : standard.ten;
    };
    
    const availableStandards = useMemo(() => {
        return categories.tieuChuan
            .filter(tc => 
                (tc.is_active !== false) && // Only show active standards in dropdown
                !formData.tieu_chuan_ids?.includes(tc.id) && // Don't show already selected standards
                getStandardDisplay(tc).toLowerCase().includes(standardsSearchTerm.toLowerCase()) // Filter by search term
            )
            .sort((a, b) => a.ten.localeCompare(b.ten));
    }, [categories.tieuChuan, formData.tieu_chuan_ids, standardsSearchTerm]);

    const availableIsoRefs = useMemo(() => {
        return categories.tieuChuan
            .filter(tc => 
                (tc.is_active !== false) && 
                !formData.iso_tham_chieu?.includes(tc.id) &&
                getStandardDisplay(tc).toLowerCase().includes(isoRefSearchTerm.toLowerCase())
            )
            .sort((a, b) => a.ten.localeCompare(b.ten));
    }, [categories.tieuChuan, formData.iso_tham_chieu, isoRefSearchTerm]);


    const inputStyles = "mt-1 block w-full rounded-md bg-white py-2.5 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400";
    const labelStyles = "block text-sm font-medium text-gray-900";

    const TabButton: React.FC<{ tabId: 'basic' | 'references'; title: string }> = ({ tabId, title }) => (
        <button
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === tabId
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
            {title}
        </button>
    );

    return (
        <form id={id} onSubmit={handleSubmit} noValidate>
             <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                    <TabButton tabId="basic" title="Thông tin Cơ bản" />
                    <TabButton tabId="references" title="Tham chiếu & Liên kết" />
                </nav>
            </div>
            <div className="p-6">
                {activeTab === 'basic' && (
                     <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <label htmlFor="ten_tai_lieu" className={labelStyles}>Tên tài liệu</label>
                                <input type="text" name="ten_tai_lieu" id="ten_tai_lieu" value={formData.ten_tai_lieu} onChange={handleChange} required className={`${inputStyles} ${errors.ten_tai_lieu ? 'border-red-500' : 'border-gray-300'}`} placeholder="VD: Quy trình Quản lý Nhà thầu phụ" />
                                {errors.ten_tai_lieu && <p className="mt-1 text-sm text-red-600">{errors.ten_tai_lieu}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="so_hieu" className={labelStyles}>Số hiệu (tùy chọn)</label>
                                <input type="text" name="so_hieu" id="so_hieu" value={formData.so_hieu} onChange={handleChange} className={`${inputStyles} border-gray-300`} placeholder="VD: QT-01-HCNS" />
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="loai_tai_lieu" className={labelStyles}>Loại tài liệu</label>
                                <select id="loai_tai_lieu" name="loai_tai_lieu" value={formData.loai_tai_lieu} onChange={handleChange} required className={`${inputStyles} ${errors.loai_tai_lieu ? 'border-red-500' : 'border-gray-300'}`}>
                                    <option value="">Chọn loại</option>
                                    {activeOrCurrentlySelected(categories.loaiTaiLieu, formData.loai_tai_lieu).map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
                                </select>
                                {errors.loai_tai_lieu && <p className="mt-1 text-sm text-red-600">{errors.loai_tai_lieu}</p>}
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="phong_ban_quan_ly" className={labelStyles}>Phòng ban quản lý</label>
                                <select id="phong_ban_quan_ly" name="phong_ban_quan_ly" value={formData.phong_ban_quan_ly} onChange={handleChange} required className={`${inputStyles} ${errors.phong_ban_quan_ly ? 'border-red-500' : 'border-gray-300'}`}>
                                    <option value="">Chọn phòng ban</option>
                                    {activeOrCurrentlySelected(categories.phongBan, formData.phong_ban_quan_ly).map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
                                </select>
                                {errors.phong_ban_quan_ly && <p className="mt-1 text-sm text-red-600">{errors.phong_ban_quan_ly}</p>}
                            </div>
                            
                            <div className="sm:col-span-3">
                                <label htmlFor="cap_do" className={labelStyles}>Cấp độ</label>
                                <select id="cap_do" name="cap_do" value={formData.cap_do} onChange={handleChange} required className={`${inputStyles} ${errors.cap_do ? 'border-red-500' : 'border-gray-300'}`}>
                                    <option value="">Chọn cấp độ</option>
                                    {activeOrCurrentlySelected(categories.capDoTaiLieu, formData.cap_do).map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
                                </select>
                                {errors.cap_do && <p className="mt-1 text-sm text-red-600">{errors.cap_do}</p>}
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="muc_do_bao_mat" className={labelStyles}>Mức độ bảo mật</label>
                                <select id="muc_do_bao_mat" name="muc_do_bao_mat" value={formData.muc_do_bao_mat} onChange={handleChange} required className={`${inputStyles} ${errors.muc_do_bao_mat ? 'border-red-500' : 'border-gray-300'}`}>
                                    <option value="">Chọn mức độ</option>
                                    {activeOrCurrentlySelected(categories.mucDoBaoMat, formData.muc_do_bao_mat).map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
                                </select>
                                {errors.muc_do_bao_mat && <p className="mt-1 text-sm text-red-600">{errors.muc_do_bao_mat}</p>}
                            </div>

                            <div className="sm:col-span-6">
                                <label htmlFor="mo_ta_tom_tat" className={labelStyles}>Mô tả tóm tắt</label>
                                <textarea id="mo_ta_tom_tat" name="mo_ta_tom_tat" rows={3} value={formData.mo_ta_tom_tat} onChange={handleChange} className={`${inputStyles} border-gray-300`} placeholder="Mô tả ngắn gọn về mục đích và nội dung của tài liệu..." />
                            </div>
                            
                            <div className="sm:col-span-6">
                                <label htmlFor="pham_vi_ap_dung" className={labelStyles}>Phạm vi áp dụng (phân cách bởi dấu phẩy)</label>
                                <input type="text" name="pham_vi_ap_dung" id="pham_vi_ap_dung" value={formData.pham_vi_ap_dung.join(', ')} onChange={handleArrayChange} className={`${inputStyles} border-gray-300`} placeholder="VD: Nhà máy A, Khối văn phòng" />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="nguoi_soan_thao" className={labelStyles}>Người soạn thảo</label>
                                <select id="nguoi_soan_thao" name="nguoi_soan_thao" value={formData.nguoi_soan_thao} onChange={handleChange} required className={`${inputStyles} ${errors.nguoi_soan_thao ? 'border-red-500' : 'border-gray-300'}`}>
                                    <option value="">Chọn người</option>
                                    {categories.nhanSu.filter(u => u.is_active !== false || u.id === formData.nguoi_soan_thao).map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
                                </select>
                                {errors.nguoi_soan_thao && <p className="mt-1 text-sm text-red-600">{errors.nguoi_soan_thao}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="nguoi_ra_soat" className={labelStyles}>Người rà soát</label>
                                <select id="nguoi_ra_soat" name="nguoi_ra_soat" value={formData.nguoi_ra_soat} onChange={handleChange} required className={`${inputStyles} ${errors.nguoi_ra_soat ? 'border-red-500' : 'border-gray-300'}`}>
                                    <option value="">Chọn người</option>
                                    {categories.nhanSu.filter(u => u.is_active !== false || u.id === formData.nguoi_ra_soat).map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
                                </select>
                                {errors.nguoi_ra_soat && <p className="mt-1 text-sm text-red-600">{errors.nguoi_ra_soat}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="nguoi_phe_duyet" className={labelStyles}>Người phê duyệt</label>
                                <select id="nguoi_phe_duyet" name="nguoi_phe_duyet" value={formData.nguoi_phe_duyet} onChange={handleChange} required className={`${inputStyles} ${errors.nguoi_phe_duyet ? 'border-red-500' : 'border-gray-300'}`}>
                                    <option value="">Chọn người</option>
                                    {categories.nhanSu.filter(u => u.is_active !== false || u.id === formData.nguoi_phe_duyet).map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
                                </select>
                                {errors.nguoi_phe_duyet && <p className="mt-1 text-sm text-red-600">{errors.nguoi_phe_duyet}</p>}
                            </div>
                            
                            <div className="sm:col-span-2">
                                <label htmlFor="ngay_ban_hanh" className={labelStyles}>Ngày ban hành</label>
                                <DatePicker id="ngay_ban_hanh" value={formData.ngay_ban_hanh} onChange={value => handleDateChange('ngay_ban_hanh', value)} required className={`${inputStyles} ${errors.ngay_ban_hanh ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.ngay_ban_hanh && <p className="mt-1 text-sm text-red-600">{errors.ngay_ban_hanh}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="ngay_hieu_luc" className={labelStyles}>Ngày hiệu lực</label>
                                <DatePicker id="ngay_hieu_luc" value={formData.ngay_hieu_luc} onChange={value => handleDateChange('ngay_hieu_luc', value)} required className={`${inputStyles} ${errors.ngay_hieu_luc || dateError ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.ngay_hieu_luc && <p className="mt-1 text-sm text-red-600">{errors.ngay_hieu_luc}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="ngay_het_hieu_luc" className={labelStyles}>Ngày hết hiệu lực (tùy chọn)</label>
                                <DatePicker id="ngay_het_hieu_luc" value={formData.ngay_het_hieu_luc} onChange={value => handleDateChange('ngay_het_hieu_luc', value)} className={`${inputStyles} ${dateError ? 'border-red-500' : 'border-gray-300'}`} />
                                {dateError && <p className="mt-2 text-sm text-red-600">{dateError}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'references' && (
                     <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                             <div className="sm:col-span-6">
                                <label htmlFor="ma_tl_cha" className={labelStyles}>Tài liệu cha (tùy chọn)</label>
                                <select id="ma_tl_cha" name="ma_tl_cha" value={formData.ma_tl_cha || ''} onChange={handleChange} className={`${inputStyles} border-gray-300`}>
                                    <option value="">Không có</option>
                                    {potentialParentDocuments.map(doc => <option key={doc.ma_tl} value={doc.ma_tl}>{`${doc.ten_tai_lieu} (${doc.so_hieu})`}</option>)}
                                </select>
                            </div>

                             <div className="sm:col-span-6">
                                <fieldset>
                                    <legend className="text-base font-medium text-gray-900">Tham chiếu</legend>
                                    <div className="mt-4 space-y-4">
                                        <div ref={standardsDropdownRef} className="relative">
                                            <label className={labelStyles}>Tiêu chuẩn áp dụng</label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsStandardsDropdownOpen(prev => !prev)}
                                                    className={`${inputStyles} border-gray-300 flex items-center justify-between text-left`}
                                                >
                                                    <div className="flex flex-wrap gap-2 items-center min-h-[22px]">
                                                        {(formData.tieu_chuan_ids || []).length > 0 ? (
                                                            (formData.tieu_chuan_ids || []).map(id => {
                                                                const standard = categories.tieuChuan.find(tc => tc.id === id);
                                                                return (
                                                                    <span key={id} className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                                                        {getStandardDisplay(standard)}
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => { e.stopPropagation(); handleRemoveStandard(id); }}
                                                                            className="h-3.5 w-3.5 rounded-full text-blue-600 hover:bg-blue-200"
                                                                        >
                                                                            <Icon type="x-mark" className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </span>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="text-gray-400">Chọn tiêu chuẩn...</span>
                                                        )}
                                                    </div>
                                                    <Icon type="chevron-down" className="h-5 w-5 text-gray-400" />
                                                </button>
                                                
                                                {isStandardsDropdownOpen && (
                                                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-hidden flex flex-col">
                                                        <div className="p-2 border-b border-gray-200">
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={standardsSearchTerm}
                                                                    onChange={(e) => setStandardsSearchTerm(e.target.value)}
                                                                    placeholder="Tìm kiếm tiêu chuẩn..."
                                                                    className="w-full rounded-md border-gray-300 py-1.5 px-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-8"
                                                                />
                                                                {standardsSearchTerm && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setStandardsSearchTerm('')}
                                                                        className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600"
                                                                        title="Xóa"
                                                                    >
                                                                        <Icon type="x-mark" className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ul className="overflow-y-auto">
                                                            {availableStandards.length > 0 ? (
                                                                availableStandards.map(tc => (
                                                                    <li
                                                                        key={tc.id}
                                                                        onClick={() => handleSelectStandard(tc.id)}
                                                                        className="px-3 py-2 text-sm text-gray-800 hover:bg-slate-100 cursor-pointer"
                                                                    >
                                                                        {getStandardDisplay(tc)}
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="px-3 py-2 text-sm text-gray-500">Không tìm thấy tiêu chuẩn.</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div ref={isoRefDropdownRef} className="relative">
                                            <label className={labelStyles}>ISO tham chiếu</label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsIsoRefDropdownOpen(prev => !prev)}
                                                    className={`${inputStyles} border-gray-300 flex items-center justify-between text-left`}
                                                >
                                                    <div className="flex flex-wrap gap-2 items-center min-h-[22px]">
                                                        {(formData.iso_tham_chieu || []).length > 0 ? (
                                                            (formData.iso_tham_chieu || []).map(id => {
                                                                const standard = categories.tieuChuan.find(tc => tc.id === id);
                                                                return (
                                                                    <span key={id} className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                                                        {getStandardDisplay(standard)}
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => { e.stopPropagation(); handleRemoveIsoRef(id); }}
                                                                            className="h-3.5 w-3.5 rounded-full text-blue-600 hover:bg-blue-200"
                                                                        >
                                                                            <Icon type="x-mark" className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </span>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="text-gray-400">Chọn ISO tham chiếu...</span>
                                                        )}
                                                    </div>
                                                    <Icon type="chevron-down" className="h-5 w-5 text-gray-400" />
                                                </button>
                                                
                                                {isIsoRefDropdownOpen && (
                                                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-hidden flex flex-col">
                                                        <div className="p-2 border-b border-gray-200">
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={isoRefSearchTerm}
                                                                    onChange={(e) => setIsoRefSearchTerm(e.target.value)}
                                                                    placeholder="Tìm kiếm tiêu chuẩn..."
                                                                    className="w-full rounded-md border-gray-300 py-1.5 px-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-8"
                                                                />
                                                                {isoRefSearchTerm && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsoRefSearchTerm('')}
                                                                        className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600"
                                                                        title="Xóa"
                                                                    >
                                                                        <Icon type="x-mark" className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ul className="overflow-y-auto">
                                                            {availableIsoRefs.length > 0 ? (
                                                                availableIsoRefs.map(tc => (
                                                                    <li
                                                                        key={tc.id}
                                                                        onClick={() => handleSelectIsoRef(tc.id)}
                                                                        className="px-3 py-2 text-sm text-gray-800 hover:bg-slate-100 cursor-pointer"
                                                                    >
                                                                        {getStandardDisplay(tc)}
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="px-3 py-2 text-sm text-gray-500">Không tìm thấy tiêu chuẩn.</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="tieu_chuan_khac" className={labelStyles}>Tiêu chuẩn khác (phân cách bởi dấu phẩy)</label>
                                            <input type="text" name="tieu_chuan_khac" id="tieu_chuan_khac" value={formData.tieu_chuan_khac.join(', ')} onChange={handleArrayChange} className={`${inputStyles} border-gray-300`} />
                                        </div>
                                        <div>
                                            <label htmlFor="phap_ly_tham_chieu" className={labelStyles}>Pháp lý tham chiếu (phân cách bởi dấu phẩy)</label>
                                            <input type="text" name="phap_ly_tham_chieu" id="phap_ly_tham_chieu" value={formData.phap_ly_tham_chieu.join(', ')} onChange={handleArrayChange} className={`${inputStyles} border-gray-300`} />
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                            
                             <div className="sm:col-span-6">
                                <fieldset>
                                    <legend className="text-base font-medium text-gray-900">Tập tin đính kèm</legend>
                                     <div className="mt-4 space-y-4">
                                        <div>
                                            <label htmlFor="link_drive" className={labelStyles}>Link Google Drive</label>
                                            <input type="url" name="link_drive" id="link_drive" value={formData.link_drive || ''} onChange={handleChange} className={`${inputStyles} border-gray-300`} placeholder="https://docs.google.com/..." />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="file_pdf" className={labelStyles}>Link File PDF</label>
                                                <input type="url" name="file_pdf" id="file_pdf" value={formData.file_pdf || ''} onChange={handleChange} className={`${inputStyles} border-gray-300`} placeholder="https://example.com/file.pdf" />
                                            </div>
                                            <div>
                                                <label htmlFor="file_docx" className={labelStyles}>Link File DOCX</label>
                                                <input type="url" name="file_docx" id="file_docx" value={formData.file_docx || ''} onChange={handleChange} className={`${inputStyles} border-gray-300`} placeholder="https://example.com/file.docx" />
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
};

export default DocumentForm;