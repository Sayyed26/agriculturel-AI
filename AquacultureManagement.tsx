
import React, { useState, useEffect, useMemo } from 'react';
import { getFishPonds, getFishBatches, getAquacultureTransactions, addAquacultureTransaction } from '../services/mockApiService';
import type { FishPond, FishBatch, AquacultureTransaction, PaymentMethod } from '../types';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { Fish, Plus, Thermometer, Droplets, Wind, AlertTriangle, ShoppingCart, ArrowUpDown, X } from 'lucide-react';
import { useCurrency } from './CurrencyContext';
import { formatCurrency } from './common/formatters';

type Tab = 'ponds' | 'transactions';
const paymentMethods: PaymentMethod[] = ['Cash', 'E-Banking', 'Online', 'Card', 'UPI', 'Other'];

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

export const AquacultureManagement: React.FC = () => {
    const [ponds, setPonds] = useState<FishPond[]>([]);
    const [batches, setBatches] = useState<FishBatch[]>([]);
    const [transactions, setTransactions] = useState<AquacultureTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('ponds');
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    const fetchData = () => {
        setLoading(true);
        Promise.all([getFishPonds(), getFishBatches(), getAquacultureTransactions()]).then(([pondData, batchData, transactionData]) => {
            setPonds(pondData);
            setBatches(batchData);
            setTransactions(transactionData);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const { items: sortedTransactions, requestSort, sortConfig } = useSortableData(transactions, { key: 'date', direction: 'descending' });

    const handleSaveTransaction = async (data: Omit<AquacultureTransaction, 'id'>) => {
        await addAquacultureTransaction(data);
        fetchData();
        setIsTransactionModalOpen(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    const tabItems: {id: Tab, label: string, icon: React.ReactNode}[] = [
        { id: 'ponds', label: 'Ponds', icon: <Fish size={16} /> },
        { id: 'transactions', label: 'Transactions', icon: <ShoppingCart size={16} /> },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-on-surface">Aquaculture Management</h1>
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
            
            {activeTab === 'ponds' && <PondsView ponds={ponds} batches={batches} />}
            {activeTab === 'transactions' && <TransactionsView items={sortedTransactions} requestSort={requestSort} sortConfig={sortConfig} onAdd={() => setIsTransactionModalOpen(true)} />}

            {isTransactionModalOpen && <AquacultureTransactionModal ponds={ponds} onClose={() => setIsTransactionModalOpen(false)} onSave={handleSaveTransaction} />}
        </div>
    );
};

const PondsView = ({ ponds, batches }: { ponds: FishPond[], batches: FishBatch[] }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-end space-x-2">
            <button className="flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-md hover:bg-slate-200 transition"><Plus size={16} className="mr-2" />Log Feeding</button>
            <button className="flex items-center justify-center px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition"><Plus size={16} className="mr-2" />Add Pond</button>
        </div>
        {ponds.map(pond => {
            const pondBatches = batches.filter(b => b.pondId === pond.id);
            const hasAlert = pond.ph < 6.5 || pond.ph > 8.5 || pond.dissolvedOxygen < 5;
            return (
                <Card key={pond.id} className={`transition-all ${hasAlert ? 'border-2 border-red-400' : ''}`}>
                    <h2 className="text-xl font-semibold mb-4">{pond.name} <span className="text-sm font-normal text-slate-500">({pond.dimensions})</span></h2>
                    {hasAlert && (<div className="flex items-center text-sm text-red-600 bg-red-100 p-2 rounded-md mb-4"><AlertTriangle size={16} className="mr-2"/><span>Water quality parameters are outside optimal range!</span></div>)}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b">
                       <WaterQualityParam icon={<Thermometer size={20}/>} value={pond.waterTemperature} unit="°C" label="Temperature" />
                       <WaterQualityParam icon={<Droplets size={20}/>} value={pond.ph} unit="pH" label="Acidity" />
                       <WaterQualityParam icon={<Wind size={20}/>} value={pond.dissolvedOxygen} unit="mg/L" label="Dissolved O₂" />
                    </div>
                    <h3 className="font-semibold mb-2">Current Batches</h3>
                    <div className="space-y-2">
                        {pondBatches.length > 0 ? pondBatches.map(batch => (
                            <div key={batch.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                                <div><p className="font-bold">{batch.species}</p><p className="text-xs text-slate-500">Stocked: {batch.stockDate}</p></div>
                                <div><p className="font-bold">{batch.quantity.toLocaleString()} fish</p><p className="text-xs text-slate-500">Avg. Weight: {batch.averageWeight}g</p></div>
                            </div>
                        )) : <p className="text-sm text-slate-500">No batches in this pond.</p>}
                    </div>
                </Card>
            )
        })}
    </div>
);

const WaterQualityParam = ({ icon, value, unit, label }: { icon: React.ReactNode, value: number, unit: string, label: string }) => (
    <div className="flex items-center space-x-2">
        <div className="text-primary">{icon}</div>
        <div>
            <p className="font-bold">{value} <span className="text-xs font-normal">{unit}</span></p>
            <p className="text-xs text-slate-500">{label}</p>
        </div>
    </div>
);

const TransactionsView = ({ items, requestSort, sortConfig, onAdd }: { items: AquacultureTransaction[], requestSort: (k: keyof AquacultureTransaction) => void, sortConfig: SortConfig<AquacultureTransaction>, onAdd: () => void }) => {
    const { currency } = useCurrency();
    return (
    <Card>
        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">Aquaculture Transactions</h2><button onClick={onAdd} className="flex items-center text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition"><Plus size={16} className="mr-1"/> Add Transaction</button></div>
        <div className="overflow-x-auto"><table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('date')}>Date {getSortIcon('date', sortConfig)}</th>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('type')}>Type {getSortIcon('type', sortConfig)}</th>
                <th scope="col" className="px-4 py-3">Species</th>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('quantity')}>Quantity {getSortIcon('quantity', sortConfig)}</th>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('totalAmount')}>Amount {getSortIcon('totalAmount', sortConfig)}</th>
                <th scope="col" className="px-4 py-3">Party</th>
            </tr></thead>
            <tbody>{items.map(item => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3">{new Date(item.date).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${item.type === 'Purchase' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{item.type}</span></td>
                    <td className="px-4 py-3 font-medium">{item.species}</td>
                    <td className="px-4 py-3">{item.quantity.toLocaleString()}</td>
                    <td className={`px-4 py-3 font-semibold ${item.type === 'Purchase' ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(item.totalAmount, currency.symbol)}</td>
                    <td className="px-4 py-3">{item.party.name}</td>
                </tr>
            ))}</tbody>
        </table></div>
    </Card>
)};

const AquacultureTransactionModal = ({ ponds, onClose, onSave }: { ponds: FishPond[], onClose: () => void, onSave: (data: Omit<AquacultureTransaction, 'id'>) => void }) => {
    const { currency } = useCurrency();
    const [type, setType] = useState<'Purchase' | 'Sale'>('Purchase');
    const [formData, setFormData] = useState<Omit<AquacultureTransaction, 'id' | 'type'>>({
        date: '',
        pondId: '',
        species: 'Tilapia',
        quantity: 0,
        averageWeight: 0,
        party: { name: '', location: '', mobileNumber: '', email: '', address: '' },
        totalAmount: 0,
        paymentMethod: 'Cash',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // FIX: Updated event type to handle both input and textarea elements.
    const handlePartyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, party: { ...prev.party, [name]: value } }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ type, ...formData, totalAmount: +formData.totalAmount, quantity: +formData.quantity, averageWeight: +formData.averageWeight });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Record Aquaculture Transaction</h2><button type="button" onClick={onClose}><X size={24} /></button></div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="flex justify-center p-1 bg-slate-200 rounded-lg"><button type="button" onClick={() => setType('Purchase')} className={`w-1/2 px-4 py-2 text-sm font-bold rounded-md ${type === 'Purchase' ? 'bg-white text-primary shadow' : 'text-slate-600'}`}>Purchase</button><button type="button" onClick={() => setType('Sale')} className={`w-1/2 px-4 py-2 text-sm font-bold rounded-md ${type === 'Sale' ? 'bg-white text-primary shadow' : 'text-slate-600'}`}>Sale</button></div>
                    
                    <fieldset className="border p-4 rounded-md"><legend className="text-sm font-semibold px-2">Batch Details</legend><div className="space-y-4">
                        <select name="pondId" value={formData.pondId} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white"><option value="">-- Select Pond --</option>{ponds.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                        <div className="grid grid-cols-3 gap-4">
                            <select name="species" value={formData.species} onChange={handleChange} className="p-2 border rounded-md bg-white"><option>Tilapia</option><option>Catfish</option><option>Trout</option></select>
                            <input name="quantity" type="number" placeholder="Quantity" value={formData.quantity} onChange={handleChange} required className="p-2 border rounded-md" />
                            <input name="averageWeight" type="number" placeholder="Avg. Weight (g)" value={formData.averageWeight} onChange={handleChange} required className="p-2 border rounded-md" />
                        </div>
                    </div></fieldset>
                    
                    <fieldset className="border p-4 rounded-md"><legend className="text-sm font-semibold px-2">Transaction Details</legend><div className="grid grid-cols-2 gap-4">
                        <input name="date" type="datetime-local" value={formData.date} onChange={handleChange} required className="p-2 border rounded-md" />
                        <input name="totalAmount" type="number" placeholder={`Total Amount (${currency.symbol})`} value={formData.totalAmount} onChange={handleChange} required className="p-2 border rounded-md" />
                        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="p-2 border rounded-md bg-white col-span-2"><option value="">-- Payment Method --</option>{paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}</select>
                        <textarea name="notes" placeholder="Notes..." value={formData.notes} onChange={handleChange} className="w-full p-2 border rounded-md col-span-2" rows={2}></textarea>
                    </div></fieldset>

                    <fieldset className="border p-4 rounded-md"><legend className="text-sm font-semibold px-2">{type === 'Purchase' ? 'Seller' : 'Buyer'} Details</legend><div className="grid grid-cols-2 gap-4">
                        <input name="name" placeholder="Name" value={formData.party.name} onChange={handlePartyChange} required className="p-2 border rounded-md" />
                        <input name="mobileNumber" placeholder="Mobile Number" value={formData.party.mobileNumber} onChange={handlePartyChange} className="p-2 border rounded-md" />
                        <input name="email" type="email" placeholder="Email" value={formData.party.email} onChange={handlePartyChange} className="p-2 border rounded-md col-span-2" />
                        <input name="location" placeholder="Location" value={formData.party.location} onChange={handlePartyChange} className="p-2 border rounded-md col-span-2" />
                        <textarea name="address" placeholder="Address" value={formData.party.address} onChange={handlePartyChange} className="w-full p-2 border rounded-md col-span-2" rows={2}></textarea>
                    </div></fieldset>
                </div>
                <div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button><button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Save Transaction</button></div>
            </form>
        </div>
    );
};
