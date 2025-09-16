
import React, { useState, useEffect, useMemo } from 'react';
import { getAnimals, getMaternityRecords, addAnimal, updateAnimal, addMaternityRecord, updateMaternityRecord, getLivestockTransactions, addLivestockTransaction } from '../services/mockApiService';
import type { Animal, MaternityRecord, LivestockTransaction, PaymentMethod, TransactionParty } from '../types';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { Plus, X, Beef, HeartPulse, ArrowUpDown, Pencil, ShoppingCart } from 'lucide-react';
import { useCurrency } from './CurrencyContext';
import { formatCurrency } from './common/formatters';

type Tab = 'roster' | 'maternity' | 'transactions';
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
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
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
    if (!config || config.key !== key) {
        return <ArrowUpDown size={14} className="opacity-30" />;
    }
    return config.direction === 'ascending' ? '▲' : '▼';
};


export const StockManagement: React.FC = () => {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [maternityRecords, setMaternityRecords] = useState<MaternityRecord[]>([]);
    const [transactions, setTransactions] = useState<LivestockTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('roster');
    
    const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false);
    const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
    
    const [isMaternityModalOpen, setIsMaternityModalOpen] = useState(false);
    const [editingMaternity, setEditingMaternity] = useState<MaternityRecord | null>(null);

    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    const fetchData = () => {
        setLoading(true);
        Promise.all([getAnimals(), getMaternityRecords(), getLivestockTransactions()]).then(([animalData, maternityData, transactionData]) => {
            setAnimals(animalData);
            setMaternityRecords(maternityData);
            setTransactions(transactionData);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const { items: sortedAnimals, requestSort: requestAnimalSort, sortConfig: animalSortConfig } = useSortableData(animals, {key: 'tagId', direction: 'ascending'});
    const { items: sortedMaternity, requestSort: requestMaternitySort, sortConfig: maternitySortConfig } = useSortableData(maternityRecords, {key: 'expectedDueDate', direction: 'ascending'});
    const { items: sortedTransactions, requestSort: requestTransactionSort, sortConfig: transactionSortConfig } = useSortableData(transactions, {key: 'date', direction: 'descending'});


    const handleSaveAnimal = async (data: Animal | Omit<Animal, 'id' | 'farmId'>) => {
        if ('id' in data) {
            await updateAnimal(data);
        } else {
            await addAnimal({ ...data, farmId: 'farm-1' }); // Mock farmId
        }
        fetchData();
        setIsAnimalModalOpen(false);
        setEditingAnimal(null);
    };

    const handleSaveMaternity = async (data: MaternityRecord | Omit<MaternityRecord, 'id' | 'animalTagId'>) => {
        if ('id' in data) {
            await updateMaternityRecord(data);
        } else {
            await addMaternityRecord(data);
        }
        fetchData();
        setIsMaternityModalOpen(false);
        setEditingMaternity(null);
    };

    const handleSaveTransaction = async (data: Omit<LivestockTransaction, 'id'>) => {
        await addLivestockTransaction(data);
        fetchData();
        setIsTransactionModalOpen(false);
    };

    const tabItems: {id: Tab, label: string, icon: React.ReactNode}[] = [
        { id: 'roster', label: 'Animal Roster', icon: <Beef size={16} /> },
        { id: 'maternity', label: 'Maternity Watch', icon: <HeartPulse size={16} />},
        { id: 'transactions', label: 'Transactions', icon: <ShoppingCart size={16} /> },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-on-surface">Stock Management</h1>
            
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

            <Card>
                {loading ? <div className="flex justify-center p-8"><Spinner /></div> : (
                    <>
                    {activeTab === 'roster' && <AnimalRosterTable items={sortedAnimals} requestSort={requestAnimalSort} sortConfig={animalSortConfig} onAdd={() => { setEditingAnimal(null); setIsAnimalModalOpen(true); }} onEdit={(animal) => { setEditingAnimal(animal); setIsAnimalModalOpen(true); }} />}
                    {activeTab === 'maternity' && <MaternityWatchTable items={sortedMaternity} requestSort={requestMaternitySort} sortConfig={maternitySortConfig} onAdd={() => { setEditingMaternity(null); setIsMaternityModalOpen(true); }} onEdit={(record) => { setEditingMaternity(record); setIsMaternityModalOpen(true); }}/>}
                    {activeTab === 'transactions' && <LivestockTransactionsTable items={sortedTransactions} requestSort={requestTransactionSort} sortConfig={transactionSortConfig} onAdd={() => setIsTransactionModalOpen(true)} />}
                    </>
                )}
            </Card>

            {isAnimalModalOpen && <AnimalModal animal={editingAnimal} onClose={() => setIsAnimalModalOpen(false)} onSave={handleSaveAnimal} />}
            {isMaternityModalOpen && <MaternityModal record={editingMaternity} animals={animals} onClose={() => setIsMaternityModalOpen(false)} onSave={handleSaveMaternity} />}
            {isTransactionModalOpen && <LivestockTransactionModal animals={animals} onClose={() => setIsTransactionModalOpen(false)} onSave={handleSaveTransaction} />}

        </div>
    );
};

const AnimalRosterTable = ({ items, requestSort, sortConfig, onAdd, onEdit }: { items: Animal[], requestSort: (key: keyof Animal) => void, sortConfig: SortConfig<Animal>, onAdd: () => void, onEdit: (animal: Animal) => void }) => {
    const calculateAge = (birthDate?: string) => {
        if (!birthDate) return 'N/A';
        const diff = Date.now() - new Date(birthDate).getTime();
        if (isNaN(diff)) return 'N/A';
        const age = new Date(diff);
        const years = Math.abs(age.getUTCFullYear() - 1970);
        const months = age.getUTCMonth();
        return `${years}y ${months}m`;
    };

    return (
        <>
        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">Animal Roster</h2><button onClick={onAdd} className="flex items-center text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition"><Plus size={16} className="mr-1"/> Add Animal</button></div>
        <div className="overflow-x-auto"><table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('tagId')}>Tag ID {getSortIcon('tagId', sortConfig)}</th>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('species')}>Species {getSortIcon('species', sortConfig)}</th>
                <th scope="col" className="px-4 py-3">Breed</th>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('birthDate')}>Age {getSortIcon('birthDate', sortConfig)}</th>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('status')}>Status {getSortIcon('status', sortConfig)}</th>
                <th scope="col" className="px-4 py-3">Location</th>
                <th scope="col" className="px-4 py-3">Actions</th>
            </tr></thead>
            <tbody>{items.map(item => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-primary-dark">{item.tagId}</td>
                    <td className="px-4 py-3">{item.species}</td>
                    <td className="px-4 py-3 text-slate-600">{item.breed}</td>
                    <td className="px-4 py-3">{calculateAge(item.birthDate)}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>{item.status}</span></td>
                    <td className="px-4 py-3 text-slate-600">{item.location}</td>
                    <td className="px-4 py-3"><button onClick={() => onEdit(item)} className="p-1 text-slate-500 hover:text-primary"><Pencil size={16}/></button></td>
                </tr>
            ))}</tbody>
        </table></div>
        </>
    );
};

const MaternityWatchTable = ({ items, requestSort, sortConfig, onAdd, onEdit }: { items: MaternityRecord[], requestSort: (key: keyof MaternityRecord) => void, sortConfig: SortConfig<MaternityRecord>, onAdd: () => void, onEdit: (record: MaternityRecord) => void }) => (
    <>
        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">Maternity Watch</h2><button onClick={onAdd} className="flex items-center text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition"><Plus size={16} className="mr-1"/> Add Record</button></div>
        <div className="overflow-x-auto"><table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('animalTagId')}>Mother Tag ID {getSortIcon('animalTagId', sortConfig)}</th>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('breedingDate')}>Breeding Date {getSortIcon('breedingDate', sortConfig)}</th>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('expectedDueDate')}>Expected Due Date {getSortIcon('expectedDueDate', sortConfig)}</th>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('outcome')}>Outcome {getSortIcon('outcome', sortConfig)}</th>
                <th scope="col" className="px-4 py-3">Offspring</th>
                <th scope="col" className="px-4 py-3">Actions</th>
            </tr></thead>
            <tbody>{items.map(item => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-primary-dark">{item.animalTagId}</td>
                    <td className="px-4 py-3">{item.breedingDate}</td>
                    <td className="px-4 py-3 font-semibold">{item.expectedDueDate}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${item.outcome === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>{item.outcome}</span></td>
                    <td className="px-4 py-3 text-center">{item.offspringCount > 0 ? item.offspringCount : '-'}</td>
                    <td className="px-4 py-3"><button onClick={() => onEdit(item)} className="p-1 text-slate-500 hover:text-primary"><Pencil size={16}/></button></td>
                </tr>
            ))}</tbody>
        </table></div>
    </>
);

const LivestockTransactionsTable = ({ items, requestSort, sortConfig, onAdd }: { items: LivestockTransaction[], requestSort: (key: keyof LivestockTransaction) => void, sortConfig: SortConfig<LivestockTransaction>, onAdd: () => void }) => {
    const { currency } = useCurrency();
    return (
    <>
        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">Livestock Transactions</h2><button onClick={onAdd} className="flex items-center text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition"><Plus size={16} className="mr-1"/> Add Transaction</button></div>
        <div className="overflow-x-auto"><table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('date')}>Date {getSortIcon('date', sortConfig)}</th>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('type')}>Type {getSortIcon('type', sortConfig)}</th>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('tagId')}>Tag ID {getSortIcon('tagId', sortConfig)}</th>
                <th scope="col" className="px-4 py-3">Species</th>
                <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('amount')}>Amount {getSortIcon('amount', sortConfig)}</th>
                <th scope="col" className="px-4 py-3">Party</th>
            </tr></thead>
            <tbody>{items.map(item => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3">{new Date(item.date).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${item.type === 'Purchase' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{item.type}</span></td>
                    <td className="px-4 py-3 font-bold text-primary-dark">{item.tagId}</td>
                    <td className="px-4 py-3">{item.species}</td>
                    <td className={`px-4 py-3 font-semibold ${item.type === 'Purchase' ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(item.amount, currency.symbol)}</td>
                    <td className="px-4 py-3">{item.party.name}</td>
                </tr>
            ))}</tbody>
        </table></div>
    </>
)};

const AnimalModal = ({ animal, onClose, onSave }: { animal: Animal | null, onClose: () => void, onSave: (data: Animal | Omit<Animal, 'id' | 'farmId'>) => void}) => {
    const isEditing = !!animal;
    const [formData, setFormData] = useState({
        tagId: animal?.tagId || '',
        species: animal?.species || 'Cattle',
        breed: animal?.breed || '',
        birthDate: animal?.birthDate || '',
        status: animal?.status || 'Active',
        location: animal?.location || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(isEditing ? { ...animal!, ...formData } : formData); }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg">
                 <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">{isEditing ? 'Edit Animal' : 'Add New Animal'}</h2><button type="button" onClick={onClose}><X size={24} /></button></div>
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="tagId" placeholder="Tag ID" value={formData.tagId} onChange={handleChange} required className="p-2 border rounded-md" />
                        <select name="species" value={formData.species} onChange={handleChange} className="p-2 border rounded-md bg-white"><option>Cattle</option><option>Sheep</option><option>Pig</option><option>Chicken</option></select>
                    </div>
                    <input name="breed" placeholder="Breed" value={formData.breed} onChange={handleChange} required className="w-full p-2 border rounded-md" />
                    <div><label className="text-xs">Birth Date</label><input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded-md bg-white"><option>Active</option><option>Sold</option><option>Deceased</option></select>
                        <input name="location" placeholder="Location (e.g., Barn 3)" value={formData.location} onChange={handleChange} className="p-2 border rounded-md" />
                    </div>
                 </div>
                 <div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button><button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">{isEditing ? 'Save Changes' : 'Add Animal'}</button></div>
            </form>
        </div>
    )
};

const MaternityModal = ({ record, animals, onClose, onSave }: { record: MaternityRecord | null, animals: Animal[], onClose: () => void, onSave: (data: MaternityRecord | Omit<MaternityRecord, 'id'|'animalTagId'>) => void}) => {
    const isEditing = !!record;
    const [formData, setFormData] = useState({
        animalId: record?.animalId || '',
        breedingDate: record?.breedingDate || '',
        expectedDueDate: record?.expectedDueDate || '',
        actualBirthDate: record?.actualBirthDate || '',
        outcome: record?.outcome || 'In Progress',
        offspringCount: record?.offspringCount || 0,
        notes: record?.notes || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        setFormData({ ...formData, [name]: type === 'number' ? parseInt(value) : value });
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(isEditing ? { ...record!, ...formData } : formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg">
                 <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">{isEditing ? 'Edit Maternity Record' : 'Add New Record'}</h2><button type="button" onClick={onClose}><X size={24} /></button></div>
                 <div className="space-y-4">
                    <select name="animalId" value={formData.animalId} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white">
                        <option value="">-- Select Mother --</option>
                        {animals.filter(a => a.status === 'Active').map(a => <option key={a.id} value={a.id}>{a.tagId} ({a.breed})</option>)}
                    </select>
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs">Breeding Date</label><input name="breedingDate" type="date" value={formData.breedingDate} onChange={handleChange} required className="w-full p-2 border rounded-md" /></div>
                        <div><label className="text-xs">Expected Due Date</label><input name="expectedDueDate" type="date" value={formData.expectedDueDate} onChange={handleChange} required className="w-full p-2 border rounded-md" /></div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs">Actual Birth Date</label><input name="actualBirthDate" type="date" value={formData.actualBirthDate} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                        <select name="outcome" value={formData.outcome} onChange={handleChange} className="self-end p-2 border rounded-md bg-white"><option>In Progress</option><option>Successful</option><option>Failed</option></select>
                    </div>
                    <input name="offspringCount" type="number" placeholder="Number of Offspring" value={formData.offspringCount} onChange={handleChange} className="w-full p-2 border rounded-md" />
                    <textarea name="notes" placeholder="Notes..." value={formData.notes} onChange={handleChange} className="w-full p-2 border rounded-md" rows={2}></textarea>
                 </div>
                 <div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button><button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">{isEditing ? 'Save Changes' : 'Add Record'}</button></div>
            </form>
        </div>
    )
};

const LivestockTransactionModal = ({ animals, onClose, onSave }: { animals: Animal[], onClose: () => void, onSave: (data: Omit<LivestockTransaction, 'id'>) => void }) => {
    const { currency } = useCurrency();
    const [type, setType] = useState<'Purchase' | 'Sale'>('Purchase');
    const [formData, setFormData] = useState<Omit<LivestockTransaction, 'id' | 'type'>>({
        date: '',
        tagId: '',
        species: 'Cattle',
        breed: '',
        party: { name: '', location: '', mobileNumber: '', email: '', address: '' },
        amount: 0,
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
        onSave({ type, ...formData, amount: +formData.amount });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Record Livestock Transaction</h2><button type="button" onClick={onClose}><X size={24} /></button></div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Transaction Type */}
                    <div className="flex justify-center p-1 bg-slate-200 rounded-lg"><button type="button" onClick={() => setType('Purchase')} className={`w-1/2 px-4 py-2 text-sm font-bold rounded-md ${type === 'Purchase' ? 'bg-white text-primary shadow' : 'text-slate-600'}`}>Purchase</button><button type="button" onClick={() => setType('Sale')} className={`w-1/2 px-4 py-2 text-sm font-bold rounded-md ${type === 'Sale' ? 'bg-white text-primary shadow' : 'text-slate-600'}`}>Sale</button></div>
                    
                    {/* Animal Details */}
                    <fieldset className="border p-4 rounded-md"><legend className="text-sm font-semibold px-2">Animal Details</legend><div className="space-y-4">
                        {type === 'Sale' ? (
                             <select name="tagId" value={formData.tagId} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white">
                                <option value="">-- Select Animal to Sell --</option>
                                {animals.filter(a => a.status === 'Active').map(a => <option key={a.id} value={a.tagId}>{a.tagId} ({a.breed})</option>)}
                            </select>
                        ) : (
                            <input name="tagId" placeholder="New Tag ID" value={formData.tagId} onChange={handleChange} required className="w-full p-2 border rounded-md" />
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <select name="species" value={formData.species} onChange={handleChange} className="p-2 border rounded-md bg-white"><option>Cattle</option><option>Sheep</option><option>Pig</option><option>Chicken</option></select>
                            <input name="breed" placeholder="Breed" value={formData.breed} onChange={handleChange} required className="p-2 border rounded-md" />
                        </div>
                    </div></fieldset>
                    
                    {/* Transaction Details */}
                    <fieldset className="border p-4 rounded-md"><legend className="text-sm font-semibold px-2">Transaction Details</legend><div className="grid grid-cols-2 gap-4">
                        <input name="date" type="datetime-local" value={formData.date} onChange={handleChange} required className="p-2 border rounded-md" />
                        <input name="amount" type="number" placeholder={`Amount (${currency.symbol})`} value={formData.amount} onChange={handleChange} required className="p-2 border rounded-md" />
                        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="p-2 border rounded-md bg-white col-span-2"><option value="">-- Payment Method --</option>{paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}</select>
                        <textarea name="notes" placeholder="Notes..." value={formData.notes} onChange={handleChange} className="w-full p-2 border rounded-md col-span-2" rows={2}></textarea>
                    </div></fieldset>

                    {/* Party Details */}
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
