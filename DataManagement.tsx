import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import type { DataTypeForCleanup, RecycledItem, Task, Laborer, FinanceEntry } from '../types';
import { getDataForCleanup, getRecycleBinItems, moveItemsToRecycleBin, restoreRecycleBinItem, deleteRecycleBinItemPermanently } from '../services/mockApiService';
import { Trash2, ArchiveRestore, DatabaseZap, AlertTriangle, ShieldCheck, X } from 'lucide-react';

type Tab = 'cleanup' | 'recycleBin';
const dataTypes: DataTypeForCleanup[] = ['Completed Tasks', 'Inactive Laborers', 'Old Financial Entries'];

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">{title}</h3>
                        <div className="mt-2"><p className="text-sm text-gray-500">{children}</p></div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <button type="button" onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:w-auto sm:text-sm">Confirm</button>
                    <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
                </div>
            </div>
        </div>
    );
};


export const DataManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('cleanup');

    const tabItems: { id: Tab, label: string, icon: React.ReactNode }[] = [
        { id: 'cleanup', label: 'Bulk Cleanup', icon: <Trash2 size={16} /> },
        { id: 'recycleBin', label: 'Recycle Bin', icon: <ArchiveRestore size={16} /> },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-on-surface flex items-center"><ShieldCheck size={32} className="mr-3 text-primary"/>Data Management</h1>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabItems.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                           {tab.icon} <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            
            {activeTab === 'cleanup' && <BulkCleanupView />}
            {activeTab === 'recycleBin' && <RecycleBinView />}
        </div>
    );
};

const BulkCleanupView: React.FC = () => {
    const [dataType, setDataType] = useState<DataTypeForCleanup>(dataTypes[0]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loadedData, setLoadedData] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLoadData = async () => {
        setLoading(true);
        setSelectedIds([]);
        setLoadedData([]);

        if (dataType !== 'Inactive Laborers' && (!startDate || !endDate)) {
            alert('Please select a start and end date.');
            setLoading(false);
            return;
        }
        if (dataType !== 'Inactive Laborers' && new Date(startDate) > new Date(endDate)) {
            alert('Start date cannot be after end date.');
            setLoading(false);
            return;
        }

        const data = await getDataForCleanup(dataType, startDate, endDate);
        setLoadedData(data);
        setLoading(false);
    };

    const setDateRange = (period: 'yesterday' | 'week' | 'month' | 'year') => {
        const end = new Date();
        const start = new Date();
        switch (period) {
            case 'yesterday':
                start.setDate(start.getDate() - 1);
                end.setDate(end.getDate() - 1);
                break;
            case 'week':
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
                break;
            case 'year':
                start.setFullYear(start.getFullYear() - 1);
                break;
        }
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? loadedData.map(d => d.id) : []);
    };
    
    const handleSelectRow = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleDelete = async () => {
        await moveItemsToRecycleBin(dataType, selectedIds);
        setIsModalOpen(false);
        handleLoadData(); // Refresh data
    };

    const columns: Record<DataTypeForCleanup, { key: string; label: string; render?: (item: any) => React.ReactNode; }[]> = {
        'Completed Tasks': [
            { key: 'title', label: 'Title' },
            { key: 'assignee', label: 'Assignee' },
            { key: 'dueDate', label: 'Due Date' },
            { key: 'status', label: 'Status' },
        ],
        'Inactive Laborers': [
            { key: 'fullName', label: 'Full Name', render: (item: Laborer) => item.basicInfo.fullName },
            { key: 'designation', label: 'Designation', render: (item: Laborer) => item.employmentDetails.designation },
            { key: 'joiningDate', label: 'Joining Date', render: (item: Laborer) => item.employmentDetails.joiningDate },
            { key: 'status', label: 'Status' },
        ],
        'Old Financial Entries': [
            { key: 'date', label: 'Date' },
            { key: 'type', label: 'Type' },
            { key: 'category', label: 'Category' },
            { key: 'amount', label: 'Amount', render: (item: FinanceEntry) => `$${item.amount.toFixed(2)}`},
        ],
    };

    const currentColumns = columns[dataType];
    const showDateFilters = dataType !== 'Inactive Laborers';

    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
                 <div>
                    <label className="text-sm font-medium">Data Type</label>
                    <select 
                        value={dataType} 
                        onChange={e => {
                            setDataType(e.target.value as DataTypeForCleanup);
                            setLoadedData([]);
                            setSelectedIds([]);
                        }} 
                        className="w-full mt-1 p-2 border rounded-md bg-white"
                    >
                        {dataTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                </div>
                
                {showDateFilters ? (
                     <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">From Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-white"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium">To Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-white"/>
                        </div>
                        <div className="sm:col-span-2 flex flex-wrap gap-2">
                             <button onClick={() => setDateRange('yesterday')} className="text-xs px-2 py-1 bg-slate-200 rounded-md hover:bg-slate-300">Yesterday</button>
                             <button onClick={() => setDateRange('week')} className="text-xs px-2 py-1 bg-slate-200 rounded-md hover:bg-slate-300">Last 7 Days</button>
                             <button onClick={() => setDateRange('month')} className="text-xs px-2 py-1 bg-slate-200 rounded-md hover:bg-slate-300">Last 30 Days</button>
                             <button onClick={() => setDateRange('year')} className="text-xs px-2 py-1 bg-slate-200 rounded-md hover:bg-slate-300">Last Year</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-end h-full md:col-span-2">
                        <p className="text-sm text-slate-500 pb-2.5">Loads all inactive laborer records.</p>
                    </div>
                )}
            </div>
            <div className="flex justify-end">
                <button onClick={handleLoadData} className="w-full md:w-auto flex items-center justify-center h-10 px-4 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition">
                    <DatabaseZap size={16} className="mr-2"/> Load Data
                </button>
            </div>


            {selectedIds.length > 0 && (
                <div className="flex justify-end my-4">
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center text-sm px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition"><Trash2 size={16} className="mr-1"/> Delete {selectedIds.length} item(s)</button>
                </div>
            )}
            <div className="overflow-x-auto mt-4">
                {loading ? <div className="flex justify-center p-8"><Spinner /></div> : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr>
                            <th className="px-4 py-3 w-12"><input type="checkbox" onChange={handleSelectAll} checked={loadedData.length > 0 && selectedIds.length === loadedData.length} /></th>
                            {currentColumns.map(col => <th key={col.key} className="px-4 py-3">{col.label}</th>)}
                        </tr></thead>
                        <tbody>
                            {loadedData.map(item => (
                                <tr key={item.id} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectRow(item.id)} /></td>
                                    {currentColumns.map(col => (
                                        <td key={col.key} className="px-4 py-3">{col.render ? col.render(item) : item[col.key]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                 {!loading && loadedData.length === 0 && <p className="text-center text-slate-500 py-8">No data found for the selected criteria. Try adjusting the filter.</p>}
            </div>
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleDelete} title="Confirm Deletion">
                Are you sure you want to move {selectedIds.length} item(s) to the Recycle Bin? You can restore them later.
            </ConfirmationModal>
        </Card>
    );
};

const RecycleBinView: React.FC = () => {
    const [items, setItems] = useState<RecycledItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmingItem, setConfirmingItem] = useState<RecycledItem | null>(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        getRecycleBinItems().then(data => {
            setItems(data);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRestore = async (id: string) => {
        await restoreRecycleBinItem(id);
        fetchData();
    };

    const handlePermanentDelete = async () => {
        if (confirmingItem) {
            await deleteRecycleBinItemPermanently(confirmingItem.id);
            setConfirmingItem(null);
            fetchData();
        }
    };
    
    const getItemName = (item: RecycledItem) => {
        switch (item.type) {
            case 'Completed Tasks': return item.data.title;
            case 'Inactive Laborers': return item.data.basicInfo.fullName;
            case 'Old Financial Entries': return item.data.notes;
            default: return 'Unknown Item';
        }
    };

    return (
        <Card>
            <div className="overflow-x-auto">
                 {loading ? <div className="flex justify-center p-8"><Spinner /></div> : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr>
                            <th className="px-4 py-3">Item</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Deleted On</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr></thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium">{getItemName(item)}</td>
                                    <td className="px-4 py-3 text-slate-600">{item.type}</td>
                                    <td className="px-4 py-3 text-slate-500">{new Date(item.deletedAt).toLocaleString()}</td>
                                    <td className="px-4 py-3 flex space-x-2">
                                        <button onClick={() => handleRestore(item.id)} className="text-sm text-green-600 hover:underline">Restore</button>
                                        <button onClick={() => setConfirmingItem(item)} className="text-sm text-red-600 hover:underline">Delete Permanently</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                 {!loading && items.length === 0 && <p className="text-center text-slate-500 py-8">The Recycle Bin is empty.</p>}
            </div>
            <ConfirmationModal isOpen={!!confirmingItem} onClose={() => setConfirmingItem(null)} onConfirm={handlePermanentDelete} title="Delete Permanently?">
                Are you sure you want to permanently delete "{confirmingItem ? getItemName(confirmingItem) : ''}"? This action cannot be undone.
            </ConfirmationModal>
        </Card>
    );
};