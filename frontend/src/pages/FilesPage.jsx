import { useState, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import FileManager from '../components/features/files/FileManager';

// Sample files data
const sampleFiles = [
    { id: 'f1', name: 'Project Proposal.pdf', mime_type: 'application/pdf', size: 2456789, drive_url: 'https://drive.google.com/', download_url: '#', created_at: '2024-12-20T10:00:00', is_visible_to_client: true, uploader: { full_name: 'Alice Johnson' } },
    { id: 'f2', name: 'Brand Guidelines.pdf', mime_type: 'application/pdf', size: 5678901, drive_url: 'https://drive.google.com/', download_url: '#', created_at: '2024-12-19T14:30:00', is_visible_to_client: true, uploader: { full_name: 'Bob Smith' } },
    { id: 'f3', name: 'Invoice-December.xlsx', mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 123456, drive_url: 'https://drive.google.com/', download_url: '#', created_at: '2024-12-18T09:15:00', is_visible_to_client: false, uploader: { full_name: 'Alice Johnson' } },
    { id: 'f4', name: 'Logo-Final.png', mime_type: 'image/png', size: 456789, drive_url: 'https://drive.google.com/', thumbnail_url: 'https://via.placeholder.com/150', download_url: '#', created_at: '2024-12-17T16:45:00', is_visible_to_client: true },
    { id: 'f5', name: 'Meeting Notes.docx', mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 89012, drive_url: 'https://drive.google.com/', download_url: '#', created_at: '2024-12-16T11:00:00', is_visible_to_client: false },
    { id: 'f6', name: 'Contract.pdf', mime_type: 'application/pdf', size: 345678, drive_url: 'https://drive.google.com/', download_url: '#', created_at: '2024-12-15T10:30:00', is_visible_to_client: true },
];

// Sample clients with folders
const sampleClients = [
    { id: 'c1', name: 'TechCorp India', folderId: 'folder1', folderUrl: 'https://drive.google.com/folders/1' },
    { id: 'c2', name: 'Digital Solutions', folderId: 'folder2', folderUrl: 'https://drive.google.com/folders/2' },
    { id: 'c3', name: 'StartupXYZ', folderId: null, folderUrl: null },
];

export default function FilesPage() {
    const [files, setFiles] = useState(sampleFiles);
    const [clients] = useState(sampleClients);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    // Filter files
    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle file upload (demo)
    const handleUpload = useCallback(async (file, options) => {
        const newFile = {
            id: `f${Date.now()}`,
            name: file.name,
            mime_type: file.type,
            size: file.size,
            drive_url: 'https://drive.google.com/',
            download_url: '#',
            created_at: new Date().toISOString(),
            is_visible_to_client: false,
            uploader: { full_name: 'You' },
        };
        setFiles(prev => [newFile, ...prev]);
    }, []);

    // Handle delete
    const handleDelete = useCallback((fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);

    // Handle visibility change
    const handleVisibilityChange = useCallback((fileId, isVisible) => {
        setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, is_visible_to_client: isVisible } : f
        ));
    }, []);

    // Create client folder (demo)
    const handleCreateFolder = useCallback(async (clientId, clientName) => {
        setIsCreatingFolder(true);
        // Demo: would call API
        setTimeout(() => {
            setIsCreatingFolder(false);
            alert(`Folder created for ${clientName}`);
        }, 1500);
    }, []);

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                        Files <span className="text-cyan-400">📁</span>
                    </h1>
                    <p className="text-slate-400">Manage files stored in Google Drive</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field w-64 py-2"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Client folders sidebar */}
                <div className="xl:col-span-1">
                    <div className="glass-panel p-4 mb-4">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <span>🏢</span> Client Folders
                        </h3>
                        <div className="space-y-2">
                            {clients.map(client => (
                                <div
                                    key={client.id}
                                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedClient?.id === client.id
                                        ? 'bg-indigo-600/20 border border-indigo-500/50'
                                        : 'hover:bg-slate-800'
                                        }`}
                                    onClick={() => setSelectedClient(client)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-white text-sm">{client.name}</span>
                                        {client.folderId ? (
                                            <a
                                                href={client.folderUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-indigo-400 hover:text-indigo-300"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCreateFolder(client.id, client.name); }}
                                                disabled={isCreatingFolder}
                                                className="text-xs text-emerald-400 hover:text-emerald-300"
                                            >
                                                + Create Folder
                                            </button>
                                        )}
                                    </div>
                                    {!client.folderId && (
                                        <p className="text-xs text-slate-500 mt-1">No folder created</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="glass-panel p-4">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <span>📊</span> Storage Stats
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Total Files</span>
                                <span className="text-white font-medium">{files.length}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Public Files</span>
                                <span className="text-emerald-400 font-medium">
                                    {files.filter(f => f.is_visible_to_client).length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Private Files</span>
                                <span className="text-amber-400 font-medium">
                                    {files.filter(f => !f.is_visible_to_client).length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main file manager */}
                <div className="xl:col-span-3">
                    <FileManager
                        files={filteredFiles}
                        onUpload={handleUpload}
                        onDelete={handleDelete}
                        onVisibilityChange={handleVisibilityChange}
                        canUpload={true}
                        canDelete={true}
                        showVisibility={true}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
