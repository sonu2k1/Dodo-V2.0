import { useState, useRef } from 'react';

const mimeTypeIcons = {
    'application/pdf': '📄',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'application/vnd.ms-powerpoint': '📽️',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
    'image/jpeg': '🖼️',
    'image/png': '🖼️',
    'image/gif': '🖼️',
    'image/svg+xml': '🎨',
    'video/mp4': '🎬',
    'audio/mpeg': '🎵',
    'application/zip': '📦',
    'application/json': '📋',
    'text/plain': '📃',
    'text/csv': '📊',
};

const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export default function FileManager({
    files = [],
    onUpload,
    onDelete,
    onVisibilityChange,
    isLoading = false,
    canUpload = true,
    canDelete = true,
    showVisibility = true,
    entityType,
    entityId,
    folderId,
}) {
    const [viewMode, setViewMode] = useState('grid');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const fileList = e.target.files;
        if (fileList?.length > 0) {
            await uploadFiles(Array.from(fileList));
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setDragOver(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            await uploadFiles(droppedFiles);
        }
    };

    const uploadFiles = async (fileList) => {
        setUploading(true);
        try {
            for (const file of fileList) {
                await onUpload?.(file, { entityType, entityId, folderId });
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (fileId) => {
        if (confirm('Are you sure you want to delete this file?')) {
            onDelete?.(fileId);
        }
    };

    const toggleSelection = (fileId) => {
        setSelectedFiles(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        );
    };

    const getFileIcon = (mimeType) => {
        return mimeTypeIcons[mimeType] || '📎';
    };

    return (
        <div className="glass-panel">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <span>📁</span> Files
                    <span className="text-sm text-slate-500">({files.length})</span>
                </h3>
                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div className="flex rounded-lg bg-slate-800 p-0.5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Upload button */}
                    {canUpload && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="btn-primary py-2 px-3 text-sm"
                        >
                            {uploading ? 'Uploading...' : '+ Upload'}
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Drop zone / Content */}
            <div
                className={`p-4 transition-colors ${dragOver ? 'bg-indigo-500/10' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                {isLoading ? (
                    <div className="text-center py-8 text-slate-500">Loading files...</div>
                ) : files.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                            <span className="text-3xl">📂</span>
                        </div>
                        <p className="text-slate-400 mb-2">No files yet</p>
                        {canUpload && (
                            <p className="text-sm text-slate-500">
                                Drag & drop files here or click Upload
                            </p>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid view */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {files.map(file => (
                            <div
                                key={file.id}
                                className="glass-card p-4 hover:border-indigo-500/30 transition-all group cursor-pointer"
                                onClick={() => window.open(file.drive_url, '_blank')}
                            >
                                {/* Icon / Thumbnail */}
                                <div className="w-full aspect-square rounded-lg bg-slate-800 flex items-center justify-center mb-3 overflow-hidden">
                                    {file.thumbnail_url ? (
                                        <img src={file.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl">{getFileIcon(file.mime_type)}</span>
                                    )}
                                </div>

                                {/* Name */}
                                <h4 className="text-sm font-medium text-white truncate mb-1" title={file.name}>
                                    {file.name}
                                </h4>

                                {/* Meta */}
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>{formatFileSize(file.size)}</span>
                                    <span>{formatDate(file.created_at)}</span>
                                </div>

                                {/* Actions */}
                                <div className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={file.download_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 py-1.5 text-xs text-center bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                                    >
                                        Download
                                    </a>
                                    {canDelete && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List view */
                    <div className="space-y-2">
                        {files.map(file => (
                            <div
                                key={file.id}
                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/50 transition-colors group"
                            >
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                    {file.thumbnail_url ? (
                                        <img src={file.thumbnail_url} alt="" className="w-full h-full rounded-lg object-cover" />
                                    ) : (
                                        <span className="text-xl">{getFileIcon(file.mime_type)}</span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-white truncate">{file.name}</h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span>{formatFileSize(file.size)}</span>
                                        <span>{formatDate(file.created_at)}</span>
                                        {file.uploader && <span>by {file.uploader.full_name}</span>}
                                    </div>
                                </div>

                                {/* Visibility toggle */}
                                {showVisibility && (
                                    <button
                                        onClick={() => onVisibilityChange?.(file.id, !file.is_visible_to_client)}
                                        className={`px-2 py-1 text-xs rounded-lg ${file.is_visible_to_client
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-slate-700 text-slate-400'
                                            }`}
                                        title={file.is_visible_to_client ? 'Visible to client' : 'Hidden from client'}
                                    >
                                        {file.is_visible_to_client ? '👁️ Public' : '🔒 Private'}
                                    </button>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <a
                                        href={file.drive_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                        title="Open in Drive"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(file.id)}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
