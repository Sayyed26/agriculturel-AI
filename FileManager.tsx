
import React, { useState, useEffect, useMemo } from 'react';
import { getFiles, addFile } from '../services/mockApiService';
import type { ManagedFile } from '../types';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { Upload, X, Search, Image as ImageIcon, FileText, Sheet, FileUp, Filter } from 'lucide-react';

type Tab = 'gallery' | 'documents';
const fileTypeIcons: Record<ManagedFile['fileType'], React.ReactNode> = {
    pdf: <FileText className="text-red-500" />,
    docx: <FileText className="text-blue-500" />,
    xlsx: <Sheet className="text-green-500" />,
    jpg: <ImageIcon className="text-orange-500" />,
    png: <ImageIcon className="text-purple-500" />,
};

const fileCategories: ManagedFile['category'][] = ['Soil Report', 'Equipment Manual', 'Invoice', 'Field Photo', 'Crop Health'];

export const FileManager: React.FC = () => {
    const [files, setFiles] = useState<ManagedFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('gallery');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState<ManagedFile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    const fetchData = () => {
        setLoading(true);
        getFiles().then(data => {
            setFiles(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            const searchMatch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = categoryFilter === 'All' || file.category === categoryFilter;
            return searchMatch && categoryMatch;
        });
    }, [files, searchTerm, categoryFilter]);

    const handleAddFile = async (fileData: Omit<ManagedFile, 'id'>) => {
        await addFile(fileData);
        fetchData();
        setIsUploadModalOpen(false);
    };

    const images = filteredFiles.filter(f => f.type === 'image');
    const documents = filteredFiles.filter(f => f.type === 'document');

    return (
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold text-on-surface">Files & Gallery</h1>
                 <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center justify-center px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition">
                    <FileUp size={16} className="mr-2" />
                    Upload File
                </button>
            </div>
            
             <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input type="text" placeholder="Search files..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 border rounded-md bg-white"/>
                    </div>
                    <div className="relative flex-grow md:flex-grow-0">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full p-2 pl-10 border rounded-md bg-white appearance-none">
                            <option value="All">All Categories</option>
                            {fileCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                         <button onClick={() => setActiveTab('gallery')} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                           <ImageIcon size={16} /> <span>Image Gallery</span>
                        </button>
                        <button onClick={() => setActiveTab('documents')} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                           <FileText size={16} /> <span>Document Library</span>
                        </button>
                    </nav>
                </div>

                <div className="mt-6">
                    {loading ? <div className="flex justify-center items-center h-64"><Spinner/></div> : (
                        <>
                            {activeTab === 'gallery' && (images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {images.map(file => (
                                        <div key={file.id} className="group relative rounded-lg overflow-hidden cursor-pointer" onClick={() => setIsViewerOpen(file)}>
                                            <img src={file.url} alt={file.name} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                                                <p className="text-xs font-semibold truncate">{file.name}</p>
                                                <p className="text-xs opacity-80">{file.category}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-center text-slate-500 py-16">No images found matching your criteria.</p>)}
                            
                            {activeTab === 'documents' && (documents.length > 0 ? (
                                 <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-700">
                                            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Date Added</th><th className="px-4 py-3">Size</th></tr>
                                        </thead>
                                        <tbody>
                                            {documents.map(file => (
                                                <tr key={file.id} className="border-b hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium flex items-center space-x-2">
                                                        {fileTypeIcons[file.fileType]} <span>{file.name}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">{file.category}</td>
                                                    <td className="px-4 py-3 text-slate-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3 text-slate-500">{(file.size / 1024).toFixed(2)} MB</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <p className="text-center text-slate-500 py-16">No documents found matching your criteria.</p>)}
                        </>
                    )}
                </div>
            </Card>

            {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} onSave={handleAddFile} />}
            {isViewerOpen && <ImageViewer file={isViewerOpen} onClose={() => setIsViewerOpen(null)} />}
        </div>
    )
}

const UploadModal = ({ onClose, onSave }: { onClose: () => void, onSave: (data: Omit<ManagedFile, 'id'>) => void}) => {
    const [fileName, setFileName] = useState('');
    const [category, setCategory] = useState<ManagedFile['category']>('Field Photo');
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileName) {
            alert("Please select a file.");
            return;
        }
        setIsUploading(true);
        // Simulate upload
        setTimeout(() => {
            const isImage = ['Field Photo', 'Crop Health'].includes(category);
            const newFile: Omit<ManagedFile, 'id'> = {
                name: fileName,
                type: isImage ? 'image' : 'document',
                category: category,
                url: `https://picsum.photos/seed/${fileName.replace(/\s+/g, '')}/400/300`,
                createdAt: new Date().toISOString(),
                fileType: isImage ? 'jpg' : 'pdf',
                size: Math.floor(Math.random() * 5000) + 100, // Random size
            };
            onSave(newFile);
        }, 1500);
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg">
                 <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Upload File</h2><button type="button" onClick={onClose}><X size={24} /></button></div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                <p className="text-sm text-gray-500">{fileName || 'Click to select a file'}</p>
                            </div>
                            <input type="file" className="hidden" onChange={e => setFileName(e.target.files?.[0]?.name || '')} />
                        </label>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value as ManagedFile['category'])} className="mt-1 w-full p-2 border rounded-md bg-white">
                             {fileCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                 </div>
                 <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button>
                    <button type="submit" disabled={isUploading} className="px-4 py-2 rounded-md bg-primary text-white disabled:bg-slate-400">
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </form>
        </div>
    )
};

const ImageViewer = ({ file, onClose }: { file: ManagedFile, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="relative bg-white p-4 rounded-lg shadow-2xl max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={file.url} alt={file.name} className="max-w-full max-h-[80vh] object-contain" />
            <div className="mt-2 text-center text-on-surface bg-surface p-2">
                <p className="font-bold">{file.name}</p>
                <p className="text-sm text-slate-600">{file.category} - {new Date(file.createdAt).toLocaleString()}</p>
            </div>
            <button onClick={onClose} className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg text-slate-600 hover:text-red-500"><X size={20}/></button>
        </div>
    </div>
);
