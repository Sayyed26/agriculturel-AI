import React, { useState, useEffect, useMemo } from 'react';
import {
    getWaterSources,
    getWaterUsageRecords,
    addWaterSource,
    updateWaterSource,
    addWaterUsageRecord,
    getZonesByFarmId,
    getWaterQualityBySourceId,
    addWaterQualityRecord,
} from '../services/mockApiService';
import type { WaterSource, WaterUsageRecord, Zone, WaterQualityRecord } from '../types';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { Droplets, Plus, X, Pencil, ArrowUpDown, Edit, Database, Thermometer, Wind, AlertTriangle, TestTube } from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';


// Re-using the sortable hook logic from other components
type SortConfig<T> = {
  key: keyof T;
  direction: 'ascending' | 'descending';
} | null;

const useSortableData = <T extends object>(items: T[], config: SortConfig<T> = null) => {
    const [sortConfig, setSortConfig] = useState(config);
    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);
    const requestSort = (key: keyof T) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    return { items: sortedItems, requestSort, sortConfig };
};

const getSortIcon = <T,>(key: keyof T, config: SortConfig<T>) => {
    if (!config || config.key !== key) return <ArrowUpDown size={14} className="opacity-30" />;
    return config.direction === 'ascending' ? '▲' : '▼';
};

// Main Component
export const WaterManagement: React.FC = () => {
    const [sources, setSources] = useState<WaterSource[]>([]);
    const [usageRecords, setUsageRecords] = useState<WaterUsageRecord[]>([]);
    const [zones, setZones] = useState<Zone[]>([]); // For usage modal
    const [loading, setLoading] = useState(true);

    const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<WaterSource | null>(null);

    const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
    const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
    
    const fetchData = () => {
        setLoading(true);
        Promise.all([
            getWaterSources(),
            getWaterUsageRecords(),
            getZonesByFarmId('farm-1') // Hardcoded farm for now
        ]).then(([sourcesData, usageData, zonesData]) => {
            setSources(sourcesData);
            setUsageRecords(usageData);
            setZones(zonesData);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const { items: sortedUsage, requestSort, sortConfig } = useSortableData(usageRecords, { key: 'date', direction: 'descending' });

    const kpis = useMemo(() => {
        const totalCapacity = sources.reduce((acc, s) => acc + s.capacity, 0);
        const currentLevel = sources.reduce((acc, s) => acc + s.currentLevel, 0);
        const percentage = totalCapacity > 0 ? (currentLevel / totalCapacity) * 100 : 0;
        return { totalCapacity, currentLevel, percentage };
    }, [sources]);
    
    const handleSaveSource = async (data: WaterSource | Omit<WaterSource, 'id'|'farmId'>) => {
        if ('id' in data) {
            await updateWaterSource(data);
        } else {
            await addWaterSource({ ...data, farmId: 'farm-1' }); // Mock farmId
        }
        fetchData();
        setIsSourceModalOpen(false);
        setEditingSource(null);
    };
    
    const handleAddUsage = async (data: Omit<WaterUsageRecord, 'id' | 'sourceName'>) => {
        await addWaterUsageRecord(data);
        fetchData();
        setIsUsageModalOpen(false);
    };

    const handleAddQuality = async (data: Omit<WaterQualityRecord, 'id'>) => {
        await addWaterQualityRecord(data);
        fetchData(); // Refetch sources to update latest quality reading
        setIsQualityModalOpen(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-on-surface">Water Management</h1>

            <Card>
                <h2 className="text-xl font-semibold mb-4">Storage Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-2">
                        <div className="w-full bg-slate-200 rounded-full h-8">
                            <div
                                className="bg-blue-500 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold"
                                style={{ width: `${kpis.percentage}%` }}
                            >
                                {kpis.percentage.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-sm text-slate-500">Current Level</p>
                            <p className="text-2xl font-bold text-blue-600">{(kpis.currentLevel / 1000).toLocaleString()} K Liters</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Capacity</p>
                            <p className="text-2xl font-bold text-on-surface">{(kpis.totalCapacity / 1000).toLocaleString()} K Liters</p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Water Sources</h2>
                    <button onClick={() => { setEditingSource(null); setIsSourceModalOpen(true); }} className="flex items-center text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition"><Plus size={16} className="mr-1"/> Add Source</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sources.map(source => (
                        <WaterSourceCard key={source.id} source={source} onEdit={() => { setEditingSource(source); setIsSourceModalOpen(true); }}/>
                    ))}
                </div>
            </Card>

            <WaterQualitySection sources={sources} onAddReading={() => setIsQualityModalOpen(true)} />
            
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Usage History</h2>
                    <button onClick={() => setIsUsageModalOpen(true)} className="flex items-center text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition"><Plus size={16} className="mr-1"/> Log Usage</button>
                </div>
                <UsageHistoryTable items={sortedUsage} requestSort={requestSort} sortConfig={sortConfig} zones={zones}/>
            </Card>

            {isSourceModalOpen && <WaterSourceModal source={editingSource} onClose={() => setIsSourceModalOpen(false)} onSave={handleSaveSource} />}
            {isUsageModalOpen && <WaterUsageModal sources={sources} zones={zones} onClose={() => setIsUsageModalOpen(false)} onSave={handleAddUsage} />}
            {isQualityModalOpen && <WaterQualityModal sources={sources} onClose={() => setIsQualityModalOpen(false)} onSave={handleAddQuality} />}
        </div>
    );
};

const WaterSourceCard = ({ source, onEdit }: { source: WaterSource, onEdit: () => void }) => {
    const percentage = source.capacity > 0 ? (source.currentLevel / source.capacity) * 100 : 0;
    const isLowLevel = source.alertThreshold && percentage < source.alertThreshold;

    const iconMap = {
        'Reservoir': <Database size={24} className="text-blue-500"/>,
        'Well': <Thermometer size={24} className="text-slate-500" />, // Placeholder
        'Tank': <Wind size={24} className="text-green-500" />, // Placeholder
        'Canal': <Droplets size={24} className="text-cyan-500"/>
    };

    return (
        <div className={`p-4 border rounded-lg bg-slate-50 space-y-3 transition-all ${isLowLevel ? 'border-2 border-red-500 shadow-lg' : 'border'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-primary-dark">{source.name}</h3>
                    <p className="text-xs text-slate-500">{source.type}</p>
                </div>
                {iconMap[source.type]}
            </div>

            {isLowLevel && (
                <div className="flex items-center text-sm text-red-600 bg-red-100 p-2 rounded-md">
                    <AlertTriangle size={16} className="mr-2"/>
                    <span>Low water level!</span>
                </div>
            )}

            <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>{percentage.toFixed(1)}% Full</span>
                    <span>{source.currentLevel.toLocaleString()} / {source.capacity.toLocaleString()} L</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
            </div>

            {source.latestQuality && (
                <div className="text-xs text-slate-600 border-t pt-2 mt-2 space-y-1">
                    <p className="font-semibold">Latest Quality Reading ({source.latestQuality.date}):</p>
                    <div className="flex justify-around">
                        <span><b>pH:</b> {source.latestQuality.ph}</span>
                        <span><b>Turbidity:</b> {source.latestQuality.turbidity} NTU</span>
                        <span><b>D.O.:</b> {source.latestQuality.dissolvedOxygen} mg/L</span>
                    </div>
                </div>
            )}

            <button onClick={onEdit} className="w-full text-sm mt-2 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 transition flex items-center justify-center">
                <Edit size={14} className="mr-2"/> Edit Source
            </button>
        </div>
    );
};

const UsageHistoryTable = ({ items, requestSort, sortConfig, zones }: { items: WaterUsageRecord[], requestSort: (k: keyof WaterUsageRecord) => void, sortConfig: SortConfig<WaterUsageRecord>, zones: Zone[] }) => (
    <div className="overflow-x-auto"><table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr>
            <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('date')}>Date {getSortIcon('date', sortConfig)}</th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('sourceName')}>Source {getSortIcon('sourceName', sortConfig)}</th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('amount')}>Amount (Liters) {getSortIcon('amount', sortConfig)}</th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('purpose')}>Purpose {getSortIcon('purpose', sortConfig)}</th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('zoneId')}>Zone {getSortIcon('zoneId', sortConfig)}</th>
            <th className="px-4 py-3">Notes</th>
        </tr></thead>
        <tbody>{items.map(item => (
            <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3">{item.date}</td>
                <td className="px-4 py-3 font-medium">{item.sourceName}</td>
                <td className="px-4 py-3 text-red-600 font-semibold">{item.amount.toLocaleString()}</td>
                <td className="px-4 py-3">{item.purpose}</td>
                <td className="px-4 py-3 text-slate-500">{item.zoneId ? zones.find(f => f.id === item.zoneId)?.name || 'N/A' : 'N/A'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs italic">{item.notes}</td>
            </tr>
        ))}</tbody>
    </table></div>
);

const WaterSourceModal = ({ source, onClose, onSave }: { source: WaterSource | null, onClose: () => void, onSave: (data: WaterSource | Omit<WaterSource, 'id'|'farmId'>) => void }) => {
    const isEditing = !!source;
    const [formData, setFormData] = useState({
        name: source?.name || '',
        type: source?.type || 'Reservoir',
        capacity: source?.capacity || 0,
        currentLevel: source?.currentLevel || 0,
        alertThreshold: source?.alertThreshold || 0,
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;
        setFormData({ ...formData, [name]: type === 'number' ? parseFloat(value) || 0 : value });
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(isEditing ? { ...source!, ...formData } : formData); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">{isEditing ? 'Edit Water Source' : 'Add New Source'}</h2><button type="button" onClick={onClose}><X size={24} /></button></div>
                <div className="space-y-4">
                    <input name="name" placeholder="Source Name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-md" />
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded-md bg-white"><option>Reservoir</option><option>Well</option><option>Tank</option><option>Canal</option></select>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs">Capacity (Liters)</label><input name="capacity" type="number" value={formData.capacity} onChange={handleChange} required className="w-full p-2 border rounded-md" /></div>
                        <div><label className="text-xs">Current Level (Liters)</label><input name="currentLevel" type="number" value={formData.currentLevel} onChange={handleChange} required className="w-full p-2 border rounded-md" /></div>
                    </div>
                    <div>
                        <label className="text-xs">Low Level Alert Threshold (%)</label>
                        <input name="alertThreshold" type="number" placeholder="e.g. 20 for 20%" value={formData.alertThreshold} onChange={handleChange} className="w-full p-2 border rounded-md" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button><button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">{isEditing ? 'Save Changes' : 'Add Source'}</button></div>
            </form>
        </div>
    );
};

const WaterUsageModal = ({ sources, zones, onClose, onSave }: { sources: WaterSource[], zones: Zone[], onClose: () => void, onSave: (data: Omit<WaterUsageRecord, 'id'|'sourceName'>) => void }) => {
    const [formData, setFormData] = useState({
        sourceId: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        purpose: 'Irrigation' as WaterUsageRecord['purpose'],
        zoneId: '',
        notes: ''
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.sourceId || formData.amount <= 0) {
            alert('Please select a source and enter a valid amount.');
            return;
        }
        onSave({...formData, amount: +formData.amount});
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Log Water Usage</h2><button type="button" onClick={onClose}><X size={24} /></button></div>
                <div className="space-y-4">
                    <select name="sourceId" value={formData.sourceId} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white">
                        <option value="">-- Select Water Source --</option>
                        {sources.map(s => <option key={s.id} value={s.id}>{s.name} ({s.currentLevel.toLocaleString()} L available)</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="date" type="date" value={formData.date} onChange={handleChange} required className="p-2 border rounded-md"/>
                        <input name="amount" type="number" placeholder="Amount (Liters)" value={formData.amount} onChange={handleChange} required className="p-2 border rounded-md"/>
                    </div>
                    <select name="purpose" value={formData.purpose} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">
                        <option>Irrigation</option><option>Livestock</option><option>Cleaning</option><option>Other</option>
                    </select>
                    {formData.purpose === 'Irrigation' && (
                        <select name="zoneId" value={formData.zoneId} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">
                            <option value="">-- Select Zone (Optional) --</option>
                            {zones.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    )}
                    <textarea name="notes" placeholder="Notes..." value={formData.notes} onChange={handleChange} className="w-full p-2 border rounded-md" rows={2}></textarea>
                </div>
                <div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button><button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Log Usage</button></div>
            </form>
        </div>
    );
};

// FIX: Completed the truncated WaterQualitySection component.
const WaterQualitySection = ({ sources, onAddReading }: { sources: WaterSource[], onAddReading: () => void }) => {
    const [selectedSourceId, setSelectedSourceId] = useState<string>('');
    const [qualityData, setQualityData] = useState<WaterQualityRecord[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (sources.length > 0 && !selectedSourceId) {
            setSelectedSourceId(sources[0].id);
        }
    }, [sources, selectedSourceId]);

    useEffect(() => {
        if (selectedSourceId) {
            setLoading(true);
            getWaterQualityBySourceId(selectedSourceId).then(data => {
                setQualityData(data.reverse()); // Reverse for chronological chart
                setLoading(false);
            });
        } else {
            setQualityData([]);
        }
    }, [selectedSourceId]);
    
    return (
        <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <h2 className="text-xl font-semibold flex items-center"><TestTube size={20} className="mr-2 text-primary"/> Water Quality History</h2>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedSourceId}
                        onChange={e => setSelectedSourceId(e.target.value)}
                        className="w-full sm:w-auto p-2 border rounded-md bg-white text-sm"
                        disabled={sources.length === 0}
                    >
                        {sources.length > 0 ? (
                            sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                        ) : (
                            <option>No sources available</option>
                        )}
                    </select>
                    <button onClick={onAddReading} className="flex items-center text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition whitespace-nowrap"><Plus size={16} className="mr-1"/> Add Reading</button>
                </div>
            </div>
            {loading ? <div className="flex justify-center items-center h-80"><Spinner /></div> : qualityData.length > 0 ? (
                <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={qualityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}/>
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="ph" stroke="#8884d8" name="pH" />
                            <Line yAxisId="right" type="monotone" dataKey="turbidity" stroke="#82ca9d" name="Turbidity (NTU)" />
                            <Line yAxisId="left" type="monotone" dataKey="dissolvedOxygen" stroke="#ffc658" name="D.O. (mg/L)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className="text-center text-slate-500 py-16">No water quality data available for this source.</p>
            )}
        </Card>
    );
};

// FIX: Added missing WaterQualityModal component.
const WaterQualityModal = ({ sources, onClose, onSave }: { sources: WaterSource[], onClose: () => void, onSave: (data: Omit<WaterQualityRecord, 'id'>) => void }) => {
    const [formData, setFormData] = useState({
        sourceId: sources[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        ph: 7.0,
        turbidity: 5.0,
        dissolvedOxygen: 8.0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;
        setFormData({ ...formData, [name]: type === 'number' ? parseFloat(value) || 0 : value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.sourceId) {
            alert('Please select a water source.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add Water Quality Reading</h2>
                    <button type="button" onClick={onClose}><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Source</label>
                        <select name="sourceId" value={formData.sourceId} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md bg-white">
                            {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Date</label>
                        <input name="date" type="date" value={formData.date} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium">pH</label>
                            <input name="ph" type="number" step="0.1" value={formData.ph} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Turbidity (NTU)</label>
                            <input name="turbidity" type="number" step="0.1" value={formData.turbidity} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">D.O. (mg/L)</label>
                            <input name="dissolvedOxygen" type="number" step="0.1" value={formData.dissolvedOxygen} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Save Reading</button>
                </div>
            </form>
        </div>
    );
};
