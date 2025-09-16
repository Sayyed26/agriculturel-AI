import React, { useState, useEffect, useMemo } from 'react';
import { getInventory, getFinanceEntries } from '../services/mockApiService';
import type { InventoryItem, FinanceEntry } from '../types';
import { Card } from './common/Card';
import { BookUser, FileText, Landmark, BarChart3, ArrowLeft, Briefcase, FileSignature, BookOpen, Scaling, Layers, Activity, Plus, Pencil, X, Trash2 } from 'lucide-react';
import { useCurrency } from './CurrencyContext';
import { formatCurrency } from './common/formatters';

// --- MOCK DATA FOR NEW COMPONENTS ---
const initialMockChartOfAccounts: Ledger[] = [
    { id: 'coa-1', name: 'Cash in Hand', group: 'Current Assets', type: 'Asset', balance: 12500 },
    { id: 'coa-2', name: 'Bank Account', group: 'Current Assets', type: 'Asset', balance: 85200 },
    { id: 'coa-3', name: 'Accounts Receivable', group: 'Current Assets', type: 'Asset', balance: 42500 },
    { id: 'coa-4', name: 'Tractor', group: 'Fixed Assets', type: 'Asset', balance: 350000 },
    { id: 'coa-5', name: 'Capital Account', group: 'Capital Account', type: 'Liability', balance: 450000 },
    { id: 'coa-6', name: 'AgriSupplies Inc.', group: 'Current Liabilities', type: 'Liability', balance: 2500 },
    { id: 'coa-7', name: 'Seed Purchase', group: 'Direct Expenses', type: 'Expense', balance: 4000 },
    { id: 'coa-8', name: 'Fertilizer Purchase', group: 'Direct Expenses', type: 'Expense', balance: 2500 },
    { id: 'coa-9', name: 'Crop Sale', group: 'Direct Incomes', type: 'Income', balance: 37500 },
    { id: 'coa-10', name: 'Fuel Expenses', group: 'Indirect Expenses', type: 'Expense', balance: 300 },
    { id: 'coa-11', name: 'Labor Payments', group: 'Direct Expenses', type: 'Expense', balance: 1750 },
    { id: 'coa-12', name: 'Government Subsidy', group: 'Indirect Incomes', type: 'Income', balance: 5000 },
];

const mockRatios = {
    currentRatio: 2.5,
    grossProfitMargin: 0.65,
    netProfitMargin: 0.35,
    debtToEquity: 0.1
};

// --- TYPE DEFINITIONS ---
type View = 'main' | 'chartOfAccounts' | 'vouchers' | 'dayBook' | 'banking' | 'balanceSheet' | 'pnl' | 'stockSummary' | 'ratioAnalysis' | 'moreReports';

type Ledger = {
    id: string;
    name: string;
    group: string;
    type: 'Asset' | 'Liability' | 'Income' | 'Expense';
    balance: number;
};

// --- VOUCHER-SPECIFIC TYPES ---
type VoucherEntryLine = {
    id: number;
    drCr: 'Dr' | 'Cr';
    ledgerId: string;
    amount: number;
};
type VoucherType = 'Payment' | 'Receipt' | 'Sales' | 'Purchase' | 'Journal';


// --- MAIN COMPONENT ---
export const InventoryFinance: React.FC = () => {
    const [view, setView] = useState<View>('main');
    const [chartOfAccounts, setChartOfAccounts] = useState<Ledger[]>(initialMockChartOfAccounts);
    const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
    const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);

    const handleOpenLedgerModal = (ledger: Ledger | null) => {
        setEditingLedger(ledger);
        setIsLedgerModalOpen(true);
    };

    const handleCloseLedgerModal = () => {
        setEditingLedger(null);
        setIsLedgerModalOpen(false);
    };

    const handleSaveLedger = (ledgerData: Omit<Ledger, 'id'> | Ledger) => {
        if ('id' in ledgerData) { // Editing
            setChartOfAccounts(prev => prev.map(acc => acc.id === ledgerData.id ? ledgerData : acc));
        } else { // Creating
            const newLedger: Ledger = { ...ledgerData, id: `coa-${Date.now()}`, balance: ledgerData.balance || 0 };
            setChartOfAccounts(prev => [...prev, newLedger]);
        }
        handleCloseLedgerModal();
    };

    const renderView = () => {
        switch(view) {
            case 'chartOfAccounts': return <ChartOfAccountsView accounts={chartOfAccounts} onEdit={handleOpenLedgerModal} onCreate={() => handleOpenLedgerModal(null)} />;
            case 'vouchers': return <VoucherView accounts={chartOfAccounts} />;
            case 'dayBook': return <DayBookView />;
            case 'banking': return <BankingView />;
            case 'balanceSheet': return <BalanceSheetView accounts={chartOfAccounts} />;
            case 'pnl': return <ProfitAndLossView accounts={chartOfAccounts} />;
            case 'stockSummary': return <StockSummaryView />;
            case 'ratioAnalysis': return <RatioAnalysisView />;
            case 'moreReports': return <MoreReportsView />;
            default: return <FinanceDashboard setView={setView} />;
        }
    };
    
    return (
        <div className="space-y-6">
             <div className="flex items-center">
                {view !== 'main' && (
                    <button onClick={() => setView('main')} className="p-2 rounded-full hover:bg-slate-100 mr-2">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h1 className="text-3xl font-bold text-on-surface">Inventory & Finance</h1>
            </div>
            <div className="transition-all duration-300">
                {renderView()}
            </div>
            {isLedgerModalOpen && (
                <LedgerModal 
                    ledger={editingLedger}
                    onClose={handleCloseLedgerModal}
                    onSave={handleSaveLedger}
                />
            )}
        </div>
    );
};


// --- DASHBOARD & MENU COMPONENTS ---
const dashboardSections = [
    { 
        title: 'Masters',
        icon: <BookUser className="text-indigo-500" />,
        items: [
            { label: 'Chart of Accounts', view: 'chartOfAccounts' as View, description: 'Create, alter, and manage ledgers.'},
        ]
    },
    { 
        title: 'Transactions',
        icon: <FileSignature className="text-blue-500" />,
        items: [
            { label: 'Vouchers', view: 'vouchers' as View, description: 'Enter daily transactions.'},
            { label: 'Day Book', view: 'dayBook' as View, description: 'View all daily entries.'},
        ]
    },
    { 
        title: 'Utilities',
        icon: <Briefcase className="text-orange-500" />,
        items: [
            { label: 'Banking', view: 'banking' as View, description: 'Manage bank transactions.' },
        ]
    },
    { 
        title: 'Reports',
        icon: <BarChart3 className="text-green-500" />,
        items: [
            { label: 'Balance Sheet', view: 'balanceSheet' as View, description: 'Financial position snapshot.' },
            { label: 'Profit & Loss A/C', view: 'pnl' as View, description: 'View income and expenses.' },
            { label: 'Stock Summary', view: 'stockSummary' as View, description: 'View inventory levels.' },
            { label: 'Ratio Analysis', view: 'ratioAnalysis' as View, description: 'Analyze financial health.' },
            { label: 'Display More Reports', view: 'moreReports' as View, description: 'Access all other reports.' },
        ]
    }
];

const FinanceDashboard = ({ setView }: { setView: (v: View) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dashboardSections.map(section => (
            <Card key={section.title}>
                <h2 className="text-xl font-bold flex items-center mb-4 pb-2 border-b">
                    {React.cloneElement(section.icon, { size: 24, className: 'mr-3' })}
                    {section.title}
                </h2>
                <div className="space-y-3">
                    {section.items.map(item => (
                         <button key={item.view} onClick={() => setView(item.view)} className="block text-left w-full p-2 rounded-md hover:bg-slate-100 transition">
                            <p className="font-semibold text-primary">{item.label}</p>
                            <p className="text-xs text-slate-500">{item.description}</p>
                        </button>
                    ))}
                </div>
            </Card>
        ))}
    </div>
);

// --- SUB-VIEW COMPONENTS ---
const SectionWrapper = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode; }) => (
    <Card>
        <h2 className="text-xl font-bold flex items-center mb-4">
            {icon}
            {title}
        </h2>
        {children}
    </Card>
);

const ChartOfAccountsView = ({ accounts, onEdit, onCreate }: { accounts: Ledger[], onEdit: (ledger: Ledger) => void, onCreate: () => void }) => {
    const { currency } = useCurrency();
    return (
        <SectionWrapper title="Chart of Accounts" icon={<BookUser className="mr-3 text-indigo-500" />}>
            <div className="flex justify-end mb-4">
                <button onClick={onCreate} className="flex items-center text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition">
                    <Plus size={16} className="mr-1"/> Create Ledger
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr>
                        <th className="px-4 py-3">Account Name</th>
                        <th className="px-4 py-3">Group</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                    </tr></thead>
                    <tbody>
                        {accounts.map(acc => (
                            <tr key={acc.id} className="border-b hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium">{acc.name}</td>
                                <td className="px-4 py-3 text-slate-600">{acc.group}</td>
                                <td className={`px-4 py-3 font-semibold ${acc.type === 'Asset' || acc.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>{acc.type}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(acc.balance, currency.symbol)}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => onEdit(acc)} className="p-1 text-slate-500 hover:text-primary rounded-full hover:bg-slate-200 transition" title="Alter Ledger">
                                        <Pencil size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </SectionWrapper>
    )
};

const voucherTypes: { name: VoucherType; key: string; }[] = [
    { name: 'Payment', key: 'F5' },
    { name: 'Receipt', key: 'F6' },
    { name: 'Journal', key: 'F7' },
    { name: 'Sales', key: 'F8' },
];

const VoucherView = ({ accounts }: { accounts: Ledger[] }) => {
    const { currency } = useCurrency();
    const [activeVoucherType, setActiveVoucherType] = useState<VoucherType>('Journal');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [narration, setNarration] = useState('');
    const [entries, setEntries] = useState<VoucherEntryLine[]>([
        { id: 1, drCr: 'Dr', ledgerId: '', amount: 0 },
        { id: 2, drCr: 'Cr', ledgerId: '', amount: 0 },
    ]);

    const handleEntryChange = (id: number, field: keyof VoucherEntryLine, value: any) => {
        setEntries(prev => prev.map(entry => 
            entry.id === id ? { ...entry, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : entry
        ));
    };

    const addEntry = () => {
        const totalDebit = entries.filter(e => e.drCr === 'Dr').reduce((sum, e) => sum + e.amount, 0);
        const totalCredit = entries.filter(e => e.drCr === 'Cr').reduce((sum, e) => sum + e.amount, 0);
        const newDrCr = totalCredit > totalDebit ? 'Dr' : 'Cr';
        setEntries(prev => [...prev, { id: Date.now(), drCr: newDrCr, ledgerId: '', amount: 0 }]);
    };
    
    const removeEntry = (id: number) => {
        if (entries.length > 2) {
            setEntries(prev => prev.filter(e => e.id !== id));
        }
    };

    const totalDebit = useMemo(() => entries.filter(e => e.drCr === 'Dr').reduce((sum, e) => sum + e.amount, 0), [entries]);
    const totalCredit = useMemo(() => entries.filter(e => e.drCr === 'Cr').reduce((sum, e) => sum + e.amount, 0), [entries]);
    const totalsMatch = totalDebit === totalCredit && totalDebit > 0;

    // Auto-balance logic
    useEffect(() => {
        const lastEntry = entries[entries.length - 1];
        if (entries.length >= 2 && lastEntry.amount === 0) {
            const debitWithoutLast = entries.slice(0, -1).filter(e => e.drCr === 'Dr').reduce((sum, e) => sum + e.amount, 0);
            const creditWithoutLast = entries.slice(0, -1).filter(e => e.drCr === 'Cr').reduce((sum, e) => sum + e.amount, 0);
            
            if (debitWithoutLast !== creditWithoutLast) {
                const difference = Math.abs(debitWithoutLast - creditWithoutLast);
                if (lastEntry.amount !== difference) {
                    const newEntries = [...entries];
                    newEntries[newEntries.length - 1] = {
                        ...lastEntry,
                        amount: difference,
                        drCr: debitWithoutLast > creditWithoutLast ? 'Cr' : 'Dr'
                    };
                    setEntries(newEntries);
                }
            }
        }
    }, [entries, totalDebit, totalCredit]);
    
    const handleSave = () => {
        alert(`Voucher Saved!\nType: ${activeVoucherType}\nDate: ${date}\nTotal: ${formatCurrency(totalDebit, currency.symbol)}\nNarration: ${narration}`);
        setEntries([
            { id: 1, drCr: 'Dr', ledgerId: '', amount: 0 },
            { id: 2, drCr: 'Cr', ledgerId: '', amount: 0 },
        ]);
        setNarration('');
    };

    return (
        <SectionWrapper title="Voucher Entry" icon={<FileSignature className="mr-3 text-blue-500" />}>
             <div className="flex flex-wrap gap-2 mb-4 border-b pb-4">
                {voucherTypes.map(vt => (
                    <button key={vt.key} onClick={() => setActiveVoucherType(vt.name)} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeVoucherType === vt.name ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                        {vt.name} <span className="text-xs font-mono p-1 rounded bg-slate-300/50">{vt.key}</span>
                    </button>
                ))}
            </div>
            <div className="grid md:grid-cols-5 gap-4 mb-4">
                <div className="md:col-span-2">
                    <label className="text-sm font-medium">Voucher No.</label>
                    <input type="text" readOnly value="Auto-1" className="w-full mt-1 p-2 border rounded-md bg-slate-100" />
                </div>
                 <div className="md:col-span-3">
                    <label className="text-sm font-medium">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-white" />
                </div>
            </div>
            
            <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600"><tr>
                        <th className="px-4 py-2 w-24">Dr/Cr</th>
                        <th className="px-4 py-2 text-left">Particulars</th>
                        <th className="px-4 py-2 text-right w-40">Amount</th>
                        <th className="px-4 py-2 w-16"></th>
                    </tr></thead>
                    <tbody>
                        {entries.map((entry, index) => (
                        <tr key={entry.id} className="border-b">
                            <td className="px-2 py-1"><select value={entry.drCr} onChange={e => handleEntryChange(entry.id, 'drCr', e.target.value)} className="w-full p-2 border-0 rounded-md bg-transparent focus:ring-1 focus:ring-primary"><option>Dr</option><option>Cr</option></select></td>
                            <td className="px-2 py-1"><select value={entry.ledgerId} onChange={e => handleEntryChange(entry.id, 'ledgerId', e.target.value)} className="w-full p-2 border-0 rounded-md bg-transparent focus:ring-1 focus:ring-primary"><option value="">-- Select Ledger --</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></td>
                            <td className="px-2 py-1"><input type="number" step="0.01" value={entry.amount || ''} onChange={e => handleEntryChange(entry.id, 'amount', e.target.value)} className="w-full p-2 border-0 rounded-md bg-transparent text-right focus:ring-1 focus:ring-primary" placeholder="0.00" /></td>
                            <td className="px-2 py-1 text-center">{entries.length > 2 && <button onClick={() => removeEntry(entry.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={14} /></button>}</td>
                        </tr>
                        ))}
                    </tbody>
                    <tfoot className="font-semibold">
                        <tr className="border-t-2">
                            <td colSpan={2} className="px-4 py-2 text-right">Total</td>
                            <td className={`px-4 py-2 text-right ${!totalsMatch && (totalDebit > 0 || totalCredit > 0) ? 'text-red-500' : ''}`}>{formatCurrency(Math.max(totalDebit, totalCredit), currency.symbol)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
             <button onClick={addEntry} className="mt-2 text-sm text-primary font-semibold">+ Add Row</button>
            
            <div className="mt-4">
                <label className="text-sm font-medium">Narration</label>
                <textarea value={narration} onChange={e => setNarration(e.target.value)} placeholder="Transaction details..." className="w-full mt-1 p-2 border rounded-md" rows={2}/>
            </div>

            <div className="mt-6 flex justify-end">
                <button onClick={handleSave} disabled={!totalsMatch} className="px-6 py-2 bg-primary text-white rounded-md font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed">Save Voucher</button>
            </div>
        </SectionWrapper>
    );
};


const DayBookView = () => {
    const [finance, setFinance] = useState<FinanceEntry[]>([]);
    const { currency } = useCurrency();
    useEffect(() => { getFinanceEntries().then(setFinance); }, []);
    return (
         <SectionWrapper title="Day Book" icon={<BookOpen className="mr-3 text-blue-500" />}>
            <div className="mb-4"><input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="p-2 border rounded-md"/></div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr>
                        <th className="px-4 py-3">Particulars</th>
                        <th className="px-4 py-3">Voucher Type</th>
                        <th className="px-4 py-3 text-right">Debit</th>
                        <th className="px-4 py-3 text-right">Credit</th>
                    </tr></thead>
                    <tbody>
                        {finance.map(entry => (
                            <tr key={entry.id} className="border-b hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium">{entry.category}</td>
                                <td className="px-4 py-3">{entry.type === 'Expense' ? 'Payment' : 'Receipt'}</td>
                                <td className="px-4 py-3 text-right">{entry.type === 'Expense' ? formatCurrency(entry.amount, currency.symbol) : '-'}</td>
                                <td className="px-4 py-3 text-right">{entry.type === 'Income' ? formatCurrency(entry.amount, currency.symbol) : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </SectionWrapper>
    )
};

const BankingView = () => <SectionWrapper title="Banking" icon={<Landmark className="mr-3 text-orange-500" />}><p className="text-slate-500">Banking features like reconciliation, deposit slips, and cheque printing will be available here.</p></SectionWrapper>;

const BalanceSheetView = ({ accounts }: { accounts: Ledger[] }) => {
    const { currency } = useCurrency();
    const assets = accounts.filter(a => a.type === 'Asset');
    const liabilities = accounts.filter(a => a.type === 'Liability');
    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);

    return (
        <SectionWrapper title="Balance Sheet" icon={<Scaling className="mr-3 text-green-500" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReportTable title="Liabilities" items={liabilities} total={totalLiabilities} currencySymbol={currency.symbol} />
                <ReportTable title="Assets" items={assets} total={totalAssets} currencySymbol={currency.symbol} />
            </div>
        </SectionWrapper>
    );
};
const ProfitAndLossView = ({ accounts }: { accounts: Ledger[] }) => {
    const { currency } = useCurrency();
    const expenses = accounts.filter(a => a.type === 'Expense');
    const incomes = accounts.filter(a => a.type === 'Income');
    const totalExpenses = expenses.reduce((sum, a) => sum + a.balance, 0);
    const totalIncomes = incomes.reduce((sum, l) => sum + l.balance, 0);
    const netProfit = totalIncomes - totalExpenses;
    
    // Add net profit to the side with the lower total to make them balance
    const pnlItems = {
        expenses: [...expenses],
        incomes: [...incomes],
    }

    if (netProfit > 0) {
        pnlItems.expenses.push({ id: 'pnl-np', name: 'Net Profit', group: '', type: 'Expense', balance: netProfit });
    } else if (netProfit < 0) {
        pnlItems.incomes.push({ id: 'pnl-nl', name: 'Net Loss', group: '', type: 'Income', balance: -netProfit });
    }

    return (
        <SectionWrapper title="Profit & Loss Account" icon={<FileText className="mr-3 text-green-500" />}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReportTable title="Expenses" items={pnlItems.expenses} total={totalExpenses + (netProfit > 0 ? netProfit : 0)} currencySymbol={currency.symbol} />
                <ReportTable title="Incomes" items={pnlItems.incomes} total={totalIncomes + (netProfit < 0 ? -netProfit : 0)} currencySymbol={currency.symbol} />
            </div>
        </SectionWrapper>
    );
};
const StockSummaryView = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const { currency } = useCurrency();
    useEffect(() => { getInventory().then(setInventory); }, []);
    
    return (
        <SectionWrapper title="Stock Summary" icon={<Layers className="mr-3 text-green-500" />}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr>
                        <th className="px-4 py-3">Item Name</th>
                        <th className="px-4 py-3 text-right">Quantity</th>
                        <th className="px-4 py-3 text-right">Unit Cost</th>
                        <th className="px-4 py-3 text-right">Stock Value</th>
                    </tr></thead>
                    <tbody>
                        {inventory.map(item => (
                            <tr key={item.id} className="border-b hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium">{item.name}</td>
                                <td className="px-4 py-3 text-right">{item.quantity.toLocaleString()} {item.unit}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(item.unitCost, currency.symbol)}</td>
                                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.unitCost * item.quantity, currency.symbol)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </SectionWrapper>
    );
};
const RatioAnalysisView = () => (
     <SectionWrapper title="Ratio Analysis" icon={<Activity className="mr-3 text-green-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RatioCard title="Current Ratio" value={mockRatios.currentRatio.toFixed(2)} interpretation="Healthy liquidity." />
            <RatioCard title="Gross Profit Margin" value={`${(mockRatios.grossProfitMargin * 100).toFixed(1)}%`} interpretation="Strong profitability on sales." />
            <RatioCard title="Net Profit Margin" value={`${(mockRatios.netProfitMargin * 100).toFixed(1)}%`} interpretation="Good overall efficiency." />
            <RatioCard title="Debt-to-Equity" value={mockRatios.debtToEquity.toFixed(2)} interpretation="Low leverage, financially stable." />
        </div>
    </SectionWrapper>
);

const MoreReportsView = () => (
    <SectionWrapper title="More Reports" icon={<BarChart3 className="mr-3 text-green-500" />}>
        <p className="text-slate-500">More reports like Trial Balance, Cash Flow Statements, and Accounts Receivable/Payable will be available here.</p>
    </SectionWrapper>
);

// --- HELPER & MODAL COMPONENTS ---

const LedgerModal = ({ ledger, onClose, onSave }: { ledger: Ledger | null, onClose: () => void, onSave: (data: Omit<Ledger, 'id'> | Ledger) => void }) => {
    const isEditing = !!ledger;
    const [formData, setFormData] = useState({
        name: ledger?.name || '',
        group: ledger?.group || '',
        type: ledger?.type || 'Expense',
        balance: ledger?.balance || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumber = e.target.getAttribute('type') === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            onSave({ ...ledger, ...formData });
        } else {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                    <h2 className="text-xl font-bold">{isEditing ? 'Alter Ledger' : 'Create New Ledger'}</h2>
                    <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-800"><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ledger Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="group" className="block text-sm font-medium text-gray-700">Group</label>
                        <input type="text" name="group" id="group" value={formData.group} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required placeholder="e.g., Current Assets, Direct Expenses"/>
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Account Type</label>
                        <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white">
                            <option value="Asset">Asset</option>
                            <option value="Liability">Liability</option>
                            <option value="Income">Income</option>
                            <option value="Expense">Expense</option>
                        </select>
                    </div>
                     { !isEditing && (
                        <div>
                            <label htmlFor="balance" className="block text-sm font-medium text-gray-700">Opening Balance</label>
                            <input type="number" name="balance" id="balance" value={formData.balance} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md font-semibold bg-primary text-white hover:bg-primary-dark">
                        {isEditing ? 'Save Changes' : 'Create Ledger'}
                    </button>
                </div>
            </form>
        </div>
    )
};


const ReportTable = ({ title, items, total, currencySymbol }: { title: string; items: { name: string, balance: number }[]; total: number; currencySymbol: string }) => (
    <div className="border rounded-lg overflow-hidden">
        <h3 className="text-lg font-bold bg-slate-100 p-3">{title}</h3>
        <table className="w-full text-sm">
            <tbody>
                {items.map(item => (
                    <tr key={item.name} className="border-t">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 text-right">{formatCurrency(item.balance, currencySymbol)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold">
                <tr className="border-t-2 border-slate-300">
                    <td className="p-2">Total</td>
                    <td className="p-2 text-right">{formatCurrency(total, currencySymbol)}</td>
                </tr>
            </tfoot>
        </table>
    </div>
);

const RatioCard = ({ title, value, interpretation }: { title: string, value: string, interpretation: string }) => (
    <div className="bg-slate-50 p-4 rounded-lg">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-primary">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{interpretation}</p>
    </div>
);