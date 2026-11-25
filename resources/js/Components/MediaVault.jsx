import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    UploadCloud, Image as ImageIcon, Video, FileText, Download, Trash2,
    Eye, X, CheckCircle2, AlertCircle, RefreshCw, Film, FolderOpen
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { withBase } from '../basePath';

const getCsrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

const ACCEPT_ALL = 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip';

export default function MediaVault({
    visitId = null,
    taskId = null,
    farmerId = null,
    initialItems = null,
    compact = false,
    title = 'Media & File Attachments',
    subtitle = 'Upload images, site videos, or documents and download files securely.',
}) {
    const { t } = useTranslation();
    const fileInputRef = useRef(null);
    const [items, setItems] = useState(() => (Array.isArray(initialItems) ? initialItems : []));
    const [loading, setLoading] = useState(!Array.isArray(initialItems));
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'image' | 'video' | 'document'
    const [caption, setCaption] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }
    const [previewItem, setPreviewItem] = useState(null);

    const fetchFiles = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (visitId) params.set('visit_id', String(visitId));
            if (taskId) params.set('task_id', String(taskId));
            if (farmerId) params.set('farmer_id', String(farmerId));
            const qs = params.toString() ? `?${params.toString()}` : '';
            const res = await fetch(withBase(`/admin/media${qs}`), {
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) return;
            const data = await res.json();
            if (Array.isArray(data.files)) {
                setItems(data.files);
            }
        } catch {
            // ignore transient network errors
        } finally {
            setLoading(false);
        }
    }, [visitId, taskId, farmerId]);

    useEffect(() => {
        if (Array.isArray(initialItems)) {
            setItems(initialItems);
            setLoading(false);
        }
        void fetchFiles();
    }, [fetchFiles, initialItems]);

    const handleUploadFiles = async (fileList) => {
        const selected = Array.from(fileList || []);
        if (selected.length === 0) return;

        setUploading(true);
        setUploadProgress(15);
        setFeedback(null);

        try {
            const formData = new FormData();
            selected.forEach((f) => formData.append('files[]', f));
            if (caption.trim()) formData.append('title', caption.trim());
            if (visitId) formData.append('visit_id', String(visitId));
            if (taskId) formData.append('task_id', String(taskId));
            if (farmerId) formData.append('farmer_id', String(farmerId));

            const uploadUrl = withBase('/admin/media/upload');
            let responseData = null;

            if (window.axios) {
                const res = await window.axios.post(uploadUrl, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    onUploadProgress: (evt) => {
                        if (evt.total) {
                            setUploadProgress(Math.min(95, Math.round((evt.loaded / evt.total) * 100)));
                        }
                    },
                });
                responseData = res.data;
            } else {
                const res = await fetch(uploadUrl, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    body: formData,
                });
                responseData = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(responseData?.message || 'Upload failed');
                }
            }

            setUploadProgress(100);
            const added = Array.isArray(responseData?.files)
                ? responseData.files
                : responseData?.file
                ? [responseData.file]
                : [];
            if (added.length > 0) {
                setItems((prev) => [...added, ...prev]);
            } else {
                await fetchFiles();
            }
            setCaption('');
            setFeedback({
                type: 'success',
                text: added.length === 1
                    ? t('File uploaded successfully.')
                    : `${added.length} ${t('files uploaded successfully.')}`,
            });
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                t('Could not upload file. Check format and 50MB size limit.');
            setFeedback({ type: 'error', text: msg });
        } finally {
            setUploading(false);
            window.setTimeout(() => setUploadProgress(0), 600);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id) => {
        try {
            const url = withBase(`/admin/media/${id}`);
            if (window.axios) {
                await window.axios.delete(url, { headers: { 'X-CSRF-TOKEN': getCsrfToken() } });
            } else {
                const res = await fetch(url, {
                    method: 'DELETE',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                });
                if (!res.ok) throw new Error('Delete failed');
            }
            setItems((prev) => prev.filter((item) => item.id !== id));
            if (previewItem?.id === id) setPreviewItem(null);
            setFeedback({ type: 'success', text: t('File deleted successfully.') });
        } catch {
            setFeedback({ type: 'error', text: t('Could not delete file.') });
        }
    };

    const counts = useMemo(() => ({
        all: items.length,
        image: items.filter((i) => i.category === 'image').length,
        video: items.filter((i) => i.category === 'video').length,
        document: items.filter((i) => i.category === 'document').length,
    }), [items]);

    const filtered = useMemo(() => {
        if (activeCategory === 'all') return items;
        return items.filter((i) => i.category === activeCategory);
    }, [items, activeCategory]);

    const triggerPicker = (accept) => {
        if (!fileInputRef.current) return;
        fileInputRef.current.accept = accept || ACCEPT_ALL;
        fileInputRef.current.click();
    };

    return (
        <div className="hp-bento-card space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hp-border">
                <div>
                    <h3 className="hp-card-title flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-hp-primary" />
                        <span>{t(title)}</span>
                        <span className="hp-chip hp-chip-primary !h-5 !text-[11px]">{items.length}</span>
                    </h3>
                    {!compact && (
                        <p className="text-xs text-hp-muted mt-0.5">{t(subtitle)}</p>
                    )}
                </div>

                <div className="flex items-center flex-wrap gap-2">
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={() => triggerPicker('image/*')}
                        className="hp-btn hp-btn-sm hp-btn-outline cursor-pointer"
                    >
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('Upload Image')}</span>
                    </button>
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={() => triggerPicker('video/*')}
                        className="hp-btn hp-btn-sm hp-btn-outline cursor-pointer"
                    >
                        <Video className="w-3.5 h-3.5 text-sky-600" />
                        <span>{t('Upload Video')}</span>
                    </button>
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={() => triggerPicker(ACCEPT_ALL)}
                        className="hp-btn hp-btn-sm hp-btn-primary cursor-pointer"
                    >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{t('Upload File')}</span>
                    </button>
                </div>
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPT_ALL}
                className="hidden"
                onChange={(e) => void handleUploadFiles(e.target.files)}
            />

            {/* Optional Caption + Drag & Drop Dropzone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    void handleUploadFiles(e.dataTransfer.files);
                }}
                className={`rounded-2xl border-2 border-dashed p-4 transition-all ${
                    dragActive
                        ? 'border-hp-primary bg-hp-primary-light/50'
                        : 'border-hp-border bg-hp-gray-50/60'
                }`}
            >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="w-10 h-10 rounded-xl bg-white border border-hp-border flex items-center justify-center shrink-0 text-hp-primary">
                            {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-hp-dark">
                                {uploading
                                    ? `${t('Uploading media...')} ${uploadProgress}%`
                                    : t('Drag & drop images, videos (MP4/MOV/WebM), or documents here')}
                            </p>
                            <p className="text-[11px] text-hp-muted">
                                {t('Supports JPG, PNG, WebP, MP4, MOV, PDF, DOCX, XLSX, CSV, ZIP (up to 50MB each)')}
                            </p>
                        </div>
                    </div>

                    <input
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={t('Optional title or label...')}
                        className="hp-input !h-9 !text-xs sm:w-52 bg-white"
                    />
                </div>

                {uploading && uploadProgress > 0 && (
                    <div className="w-full h-1.5 rounded-full bg-hp-gray-200 mt-3 overflow-hidden">
                        <div
                            className="h-full bg-hp-primary rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Feedback Banner */}
            {feedback && (
                <div
                    className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${
                        feedback.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {feedback.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{feedback.text}</span>
                    </div>
                    <button type="button" onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex items-center flex-wrap gap-1.5">
                {[
                    { id: 'all', label: t('All Files'), count: counts.all },
                    { id: 'image', label: t('Images'), count: counts.image },
                    { id: 'video', label: t('Videos'), count: counts.video },
                    { id: 'document', label: t('Documents'), count: counts.document },
                ].map((tab) => {
                    const active = activeCategory === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveCategory(tab.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                active
                                    ? 'bg-hp-dark text-white border-hp-dark'
                                    : 'bg-white text-hp-muted border-hp-border hover:text-hp-dark'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-1.5 rounded-full text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-hp-gray-100 text-hp-dark'}`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Media & Files Grid */}
            {loading ? (
                <div className="py-8 text-center text-xs text-hp-muted">{t('Loading uploaded files...')}</div>
            ) : filtered.length === 0 ? (
                <div className="py-10 text-center rounded-2xl border border-dashed border-hp-border bg-white/50">
                    <UploadCloud className="w-8 h-8 text-hp-muted mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-bold text-hp-dark">{t('No uploaded media or files yet')}</p>
                    <p className="text-xs text-hp-muted mt-0.5">
                        {t('Upload site photos, inspection videos, or documents above — files uploaded from mobile also appear here live.')}
                    </p>
                </div>
            ) : (
                <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4`}>
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-2xl bg-white border border-hp-border overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-shadow"
                        >
                            {/* Visual Preview */}
                            <div className="relative h-40 bg-slate-950/5 flex items-center justify-center overflow-hidden border-b border-hp-border">
                                {item.category === 'image' ? (
                                    <img
                                        src={item.preview_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => setPreviewItem(item)}
                                    />
                                ) : item.category === 'video' ? (
                                    <video
                                        src={item.preview_url}
                                        controls
                                        preload="metadata"
                                        className="w-full h-full object-cover bg-slate-950"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-4 text-center">
                                        <span className="w-12 h-12 rounded-2xl bg-hp-primary-light text-hp-primary flex items-center justify-center mb-2">
                                            <FileText className="w-6 h-6" />
                                        </span>
                                        <span className="text-[11px] font-mono font-bold uppercase text-hp-muted">
                                            {(item.original_name || '').split('.').pop() || 'FILE'}
                                        </span>
                                    </div>
                                )}

                                {/* Category Badge */}
                                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/75 text-white inline-flex items-center gap-1">
                                    {item.category === 'image' && <ImageIcon className="w-3 h-3" />}
                                    {item.category === 'video' && <Film className="w-3 h-3" />}
                                    {item.category === 'document' && <FileText className="w-3 h-3" />}
                                    <span>{t(item.category)}</span>
                                </span>
                            </div>

                            {/* Metadata & Actions */}
                            <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-hp-dark truncate" title={item.title}>
                                        {item.title}
                                    </p>
                                    <p className="text-[11px] text-hp-muted truncate mt-0.5">
                                        {item.size_human} • {item.uploader_name} • {item.date_label}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5 pt-2 border-t border-hp-border">
                                    {(item.category === 'image' || item.category === 'video') && (
                                        <button
                                            type="button"
                                            onClick={() => setPreviewItem(item)}
                                            className="hp-btn hp-btn-sm hp-btn-outline flex-1 justify-center cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>{t('Preview')}</span>
                                        </button>
                                    )}
                                    <a
                                        href={item.download_url}
                                        download={item.original_name}
                                        className="hp-btn hp-btn-sm hp-btn-primary flex-1 justify-center"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>{t('Download')}</span>
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => void handleDelete(item.id)}
                                        className="p-2 rounded-lg text-hp-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                        title={t('Delete')}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Fullscreen Lightbox Preview Modal (Images & Videos) */}
            {previewItem && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setPreviewItem(null)}
                >
                    <div
                        className="w-full max-w-4xl rounded-2xl bg-white overflow-hidden shadow-2xl border border-hp-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-5 py-3.5 border-b border-hp-border flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-hp-dark truncate">{previewItem.title}</p>
                                <p className="text-xs text-hp-muted truncate">
                                    {previewItem.original_name} • {previewItem.size_human} • {previewItem.uploader_name}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <a
                                    href={previewItem.download_url}
                                    download={previewItem.original_name}
                                    className="hp-btn hp-btn-sm hp-btn-primary"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{t('Download')}</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setPreviewItem(null)}
                                    className="p-2 rounded-lg text-hp-muted hover:text-hp-dark hover:bg-hp-gray-100 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-hidden">
                            {previewItem.category === 'video' ? (
                                <video
                                    src={previewItem.preview_url}
                                    controls
                                    autoPlay
                                    className="max-h-[75vh] w-full"
                                />
                            ) : (
                                <img
                                    src={previewItem.preview_url}
                                    alt={previewItem.title}
                                    className="max-h-[75vh] w-auto object-contain"
                                />
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
