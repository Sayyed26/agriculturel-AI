
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    getLaborers, 
    getFinanceEntries, 
    addLaborPayment,
    updateLaborer,
    addLaborer,
    getAttendanceForDate,
    updateAttendance,
    getAttendanceForDateRange
} from '../services/mockApiService';
import type { Laborer, FinanceEntry, AttendanceRecord, PaymentMethod, Gender, WorkShift, WageType, PaymentMode } from '../types';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { Users, DollarSign, Plus, X, CalendarDays, Pencil, FilePlus, Calculator, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useCurrency } from './CurrencyContext';
import { formatCurrency } from './common/formatters';

type Tab = 'laborers' | 'attendance' | 'payments';
type AttendanceView = 'daily' | 'monthly' | 'yearly';

type DailyAttendance = {
    laborerId: string;
    name: string;
    status: AttendanceRecord['status'];
}

type PayrollResult = {
    laborerId: string;
    name: string;
    daysWorked: number;
    wagesDue: number;
    wageRate: number;
}

type PrefillData = Omit<FinanceEntry, 'id' | 'type' | 'category'> & { laborerId?: string };

const paymentMethods: PaymentMethod[] = ['Cash', 'E-Banking', 'UPI', 'Other'];
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const LaborManagement: React.FC = () => {
    const [laborers, setLaborers] = useState<Laborer[]>([]);
    const [payments, setPayments] = useState<FinanceEntry[]>([]);
    const [attendance, setAttendance] = useState<DailyAttendance[]>([]);
    const [loading, setLoading] = useState({labor: true, payment: true, attendance: true});
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isLaborerModalOpen, setIsLaborerModalOpen] = useState(false);
    const [editingLaborer, setEditingLaborer] = useState<Laborer | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('laborers');
    const [attendanceView, setAttendanceView] = useState<AttendanceView>('daily');
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const [payrollStartDate, setPayrollStartDate] = useState('');
    const [payrollEndDate, setPayrollEndDate] = useState('');
    const [payrollResult, setPayrollResult] = useState<PayrollResult[]>([]);
    const [prefillPayment, setPrefillPayment] = useState<PrefillData | null>(null);

    const { currency } = useCurrency();

    const fetchData = useCallback(() => {
        setLoading(prev => ({...prev, labor: true, payment: true}));
        getLaborers().then(data => {
            setLaborers(data);
            setLoading(prev => ({...prev, labor: false}));
        });
        getFinanceEntries().then(financeData => {
            setPayments(financeData.filter(entry => entry.category === 'Labor Payment').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setLoading(prev => ({...prev, payment: false}));
        });
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if(activeTab === 'attendance' && attendanceView === 'daily'){
            setLoading(prev => ({...prev, attendance: true}));
            getAttendanceForDate(formatDate(currentDate)).then(data => {
                setAttendance(data);
                setLoading(prev => ({...prev, attendance: false}));
            });
        }
    }, [currentDate, activeTab, attendanceView, laborers]);

    const handleAddPayment = async (paymentData: Omit<FinanceEntry, 'id'|'type'|'category'>) => {
        await addLaborPayment(paymentData);
        fetchData(); 
        setIsPaymentModalOpen(false);
        setPrefillPayment(null);
    };

    const handleSaveLaborer = async (laborerData: Laborer | Omit<Laborer, 'id'>) => {
        if ('id' in laborerData) {
            await updateLaborer(laborerData);
        } else {
            await addLaborer(laborerData as Omit<Laborer, 'id'>);
        }
        fetchData();
        setIsLaborerModalOpen(false);
        setEditingLaborer(null);
    };

    const handleUpdateAttendance = (laborerId: string, date: string, status: AttendanceRecord['status']) => {
        if(attendanceView === 'daily') {
            setAttendance(prev => prev.map(att => att.laborerId === laborerId ? {...att, status} : att));
        }
        updateAttendance(laborerId, date, status);
    };

    const handleCalculateWages = async () => {
        if (!payrollStartDate || !payrollEndDate) {
            alert('Please select a start and end date.');
            return;
        }
        const attendanceRecords = await getAttendanceForDateRange(payrollStartDate, payrollEndDate);
        const wagesByLaborer = laborers.map(laborer => {
            const records = attendanceRecords.filter(r => r.laborerId === laborer.id);
            const daysWorked = records.reduce((total, record) => {
                if (record.status === 'Present') return total + 1;
                if (record.status === 'Half-day') return total + 0.5;
                return total;
            }, 0);
            return {
                laborerId: laborer.id,
                name: laborer.basicInfo.fullName,
                daysWorked: daysWorked,
                wageRate: laborer.employmentDetails.wageRate,
                wagesDue: daysWorked * laborer.employmentDetails.wageRate
            };
        }).filter(r => r.wagesDue > 0);
        setPayrollResult(wagesByLaborer);
    };

    const handleLogPayrollPayment = (payroll: PayrollResult) => {
        setPrefillPayment({
            date: formatDate(new Date()),
            amount: payroll.wagesDue,
            notes: `Payment for ${payroll.name} (${payroll.daysWorked} days worked from ${payrollStartDate} to ${payrollEndDate})`,
            laborerId: payroll.laborerId,
            paymentMethod: 'Cash'
        });
        setIsPaymentModalOpen(true);
    };

    const tabItems: {id: Tab, label: string, icon: React.ReactNode}[] = [
        { id: 'laborers', label: 'Laborers', icon: <Users size={16} /> },
        { id: 'attendance', label: 'Attendance', icon: <CalendarDays size={16} /> },
        { id: 'payments', label: 'Payments', icon: <DollarSign size={16} /> },
    ];
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-on-surface">Labor Management</h1>
            
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

            {activeTab === 'laborers' && (
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Manage Laborers</h2>
                        <button onClick={() => {setEditingLaborer(null); setIsLaborerModalOpen(true);}} className="flex items-center text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition"><Plus size={16} className="mr-1"/> Add Laborer</button>
                    </div>
                    {loading.labor ? <Spinner /> : (
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                               <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Designation</th><th className="px-4 py-3">Contact Number</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
                                <tbody>
                                    {laborers.map(l => (
                                        <tr key={l.id} className="border-b hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium">{l.basicInfo.fullName}</td>
                                            <td className="px-4 py-3 text-slate-600">{l.employmentDetails.designation}</td>
                                            <td className="px-4 py-3 text-slate-600">{l.basicInfo.contactNumber}</td>
                                            <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${l.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>{l.status}</span></td>
                                            <td className="px-4 py-3"><button onClick={() => {setEditingLaborer(l); setIsLaborerModalOpen(true);}} className="p-1 text-slate-500 hover:text-primary flex items-center text-xs"><Eye size={14} className="mr-1"/> View/Edit</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'attendance' && (
                <Card>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                        <h2 className="text-xl font-semibold">Attendance Log</h2>
                         <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                            {(['daily', 'monthly', 'yearly'] as AttendanceView[]).map(view => (
                                <button key={view} onClick={() => setAttendanceView(view)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors capitalize ${attendanceView === view ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>{view}</button>
                            ))}
                        </div>
                    </div>
                    {attendanceView === 'daily' && <DailyAttendanceView attendance={attendance} loading={loading.attendance} date={currentDate} setDate={setCurrentDate} onUpdate={handleUpdateAttendance} />}
                    {attendanceView === 'monthly' && <MonthlyAttendanceView laborers={laborers} date={currentDate} setDate={setCurrentDate} />}
                    {attendanceView === 'yearly' && <YearlyAttendanceView laborers={laborers} date={currentDate} setDate={setCurrentDate} />}
                </Card>
            )}

            {activeTab === 'payments' && (
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Payroll Calculator</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div><label className="text-sm font-medium">Start Date</label><input type="date" value={payrollStartDate} onChange={e => setPayrollStartDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-white"/></div>
                            <div><label className="text-sm font-medium">End Date</label><input type="date" value={payrollEndDate} onChange={e => setPayrollEndDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-white"/></div>
                            <button onClick={handleCalculateWages} className="flex items-center justify-center h-10 px-4 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition"><Calculator size={16} className="mr-2"/> Calculate Wages</button>
                        </div>
                        {payrollResult.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                               <h3 className="font-semibold mb-2">Calculated Wages</h3>
                               <div className="overflow-x-auto"><table className="w-full text-sm text-left">
                                   <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr><th className="px-4 py-2">Laborer</th><th className="px-4 py-2">Days Worked</th><th className="px-4 py-2">Wages Due</th><th className="px-4 py-2"></th></tr></thead>
                                   <tbody>
                                       {payrollResult.map(res => (
                                           <tr key={res.laborerId} className="border-b">
                                               <td className="px-4 py-2 font-medium">{res.name}</td>
                                               <td className="px-4 py-2">{res.daysWorked} (@ {formatCurrency(res.wageRate, currency.symbol)}/day)</td>
                                               <td className="px-4 py-2 font-semibold">{formatCurrency(res.wagesDue, currency.symbol)}</td>
                                               <td className="px-4 py-2 text-right"><button onClick={() => handleLogPayrollPayment(res)} className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200">Log Payment</button></td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table></div>
                            </div>
                        )}
                    </Card>
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Payment History</h2>
                            <button onClick={() => {setPrefillPayment(null); setIsPaymentModalOpen(true);}} className="flex items-center text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition"><FilePlus size={16} className="mr-1"/> Add Manual Payment</button>
                        </div>
                        {loading.payment ? <Spinner /> : (
                            <div className="overflow-x-auto"><table className="w-full text-sm text-left">
                               <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Payment Method</th><th className="px-4 py-3">Notes</th></tr></thead>
                                <tbody>
                                    {payments.map(p => (
                                        <tr key={p.id} className="border-b hover:bg-slate-50"><td className="px-4 py-3">{p.date}</td><td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(p.amount, currency.symbol)}</td><td className="px-4 py-3">{p.paymentMethod || 'N/A'}</td><td className="px-4 py-3 text-slate-500">{p.notes}</td></tr>
                                    ))}
                                </tbody>
                            </table></div>
                        )}
                    </Card>
                </div>
            )}

            {isPaymentModalOpen && <AddPaymentModal laborers={laborers} onClose={() => setIsPaymentModalOpen(false)} onSave={handleAddPayment} initialData={prefillPayment} />}
            {isLaborerModalOpen && <LaborerModal onClose={() => setIsLaborerModalOpen(false)} onSave={handleSaveLaborer} laborer={editingLaborer} />}
        </div>
    );
};

// --- Attendance Sub-Components ---
const DailyAttendanceView = ({ attendance, loading, date, setDate, onUpdate } : { attendance: DailyAttendance[], loading: boolean, date: Date, setDate: (d: Date) => void, onUpdate: (laborerId: string, date: string, status: AttendanceRecord['status']) => void}) => (
    <div>
        <div className="flex items-center justify-end mb-4">
            <input type="date" value={formatDate(date)} onChange={e => setDate(new Date(e.target.value))} className="p-2 border rounded-md bg-white text-sm" />
        </div>
         {loading ? <Spinner /> : (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr><th className="px-4 py-3">Laborer</th><th className="px-4 py-3">Status</th></tr></thead>
                    <tbody>
                        {attendance.map(att => (
                            <tr key={att.laborerId} className="border-b hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium">{att.name}</td>
                                <td className="px-4 py-3">
                                    <select value={att.status} onChange={e => onUpdate(att.laborerId, formatDate(date), e.target.value as AttendanceRecord['status'])} className="p-1 border-gray-300 rounded-md text-xs">
                                        <option value="Present">Present</option>
                                        <option value="Half-day">Half-day</option>
                                        <option value="Absent">Absent</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const MonthlyAttendanceView = ({ laborers, date, setDate }: { laborers: Laborer[], date: Date, setDate: (d: Date) => void }) => {
    const [selectedLaborerId, setSelectedLaborerId] = useState<string>(laborers[0]?.id || '');
    const [records, setRecords] = useState<AttendanceRecord[]>([]);

    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    useEffect(() => {
        if (selectedLaborerId) {
            getAttendanceForDateRange(formatDate(monthStart), formatDate(monthEnd)).then(data => {
                setRecords(data.filter(r => r.laborerId === selectedLaborerId));
            });
        }
    }, [selectedLaborerId, date, monthStart, monthEnd]);

    const changeMonth = (offset: number) => {
        setDate(new Date(date.getFullYear(), date.getMonth() + offset, 1));
    };

    const daysInMonth = useMemo(() => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        const calendarDays = [];
        for (let i = 0; i < firstDay; i++) calendarDays.push(null);
        for (let i = 1; i <= days; i++) calendarDays.push(new Date(year, month, i));
        return calendarDays;
    }, [date]);
    
    const attendanceMap = useMemo(() => new Map(records.map(r => [r.date, r.status])), [records]);
    const statusColor: Record<AttendanceRecord['status'], string> = { 'Present': 'bg-green-200', 'Half-day': 'bg-yellow-200', 'Absent': 'bg-red-200' };
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
                <select value={selectedLaborerId} onChange={e => setSelectedLaborerId(e.target.value)} className="w-full sm:w-auto p-2 border rounded-md bg-white text-sm">
                    {laborers.map(l => <option key={l.id} value={l.id}>{l.basicInfo.fullName}</option>)}
                </select>
                <div className="flex items-center space-x-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-slate-100"><ChevronLeft size={20}/></button>
                    <span className="font-semibold w-32 text-center">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-slate-100"><ChevronRight size={20}/></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-600">
                {weekDays.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
             <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`}></div>;
                    const status = attendanceMap.get(formatDate(day));
                    return (
                        <div key={day.toString()} className={`h-12 flex items-center justify-center rounded-md ${status ? statusColor[status] : 'bg-slate-50'}`}>
                           {day.getDate()}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const YearlyAttendanceView = ({ laborers, date, setDate }: { laborers: Laborer[], date: Date, setDate: (d: Date) => void }) => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);

    const yearStart = new Date(date.getFullYear(), 0, 1);
    const yearEnd = new Date(date.getFullYear(), 11, 31);
    
    useEffect(() => {
        getAttendanceForDateRange(formatDate(yearStart), formatDate(yearEnd)).then(setRecords);
    }, [date, yearStart, yearEnd]);

    const changeYear = (offset: number) => setDate(new Date(date.getFullYear() + offset, 0, 1));
    
    const summary = useMemo(() => {
        const yearlyData: Record<string, {name: string, monthlyTotals: number[], yearTotal: number}> = {};
        laborers.forEach(l => {
            yearlyData[l.id] = { name: l.basicInfo.fullName, monthlyTotals: Array(12).fill(0), yearTotal: 0 };
        });
        records.forEach(r => {
            if (!yearlyData[r.laborerId]) return;
            const month = new Date(r.date).getMonth();
            const value = r.status === 'Present' ? 1 : r.status === 'Half-day' ? 0.5 : 0;
            yearlyData[r.laborerId].monthlyTotals[month] += value;
            yearlyData[r.laborerId].yearTotal += value;
        });
        return Object.values(yearlyData);
    }, [records, laborers]);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div>
             <div className="flex items-center justify-end mb-4">
                 <div className="flex items-center space-x-2">
                    <button onClick={() => changeYear(-1)} className="p-2 rounded-md hover:bg-slate-100"><ChevronLeft size={20}/></button>
                    <span className="font-semibold w-20 text-center">{date.getFullYear()}</span>
                    <button onClick={() => changeYear(1)} className="p-2 rounded-md hover:bg-slate-100"><ChevronRight size={20}/></button>
                </div>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-700">
                        <tr>
                            <th className="px-2 py-3">Laborer</th>
                            {months.map(m => <th key={m} className="px-2 py-3 text-center">{m}</th>)}
                            <th className="px-2 py-3 text-center font-bold">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary.map(s => (
                            <tr key={s.name} className="border-b">
                                <td className="px-2 py-2 font-medium">{s.name}</td>
                                {s.monthlyTotals.map((total, i) => <td key={i} className="px-2 py-2 text-center">{total > 0 ? total : '-'}</td>)}
                                <td className="px-2 py-2 text-center font-bold text-primary-dark">{s.yearTotal}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Modal Components ---

const LaborerModal = ({ onClose, onSave, laborer }: { onClose: () => void, onSave: (data: Laborer | Omit<Laborer, 'id'>) => void, laborer: Laborer | null}) => {
    const { currency } = useCurrency();
    const emptyLaborer: Omit<Laborer, 'id'> = {
        laborIdCode: '', status: 'Active',
        basicInfo: { fullName: '', contactNumber: '', address: '' },
        employmentDetails: { designation: '', joiningDate: '', wageType: 'Daily', wageRate: 0 },
        paymentDetails: { paymentMode: 'Cash' },
        compliance: { safetyTraining: false },
        remarks: {},
        skills: []
    };
    
    const [formData, setFormData] = useState(laborer || emptyLaborer);
    const [skillInput, setSkillInput] = useState('');
    const isEditing = !!laborer;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const [section, field] = name.split('.');

        const parsedValue = (e.target as HTMLInputElement).type === 'number' ? parseFloat(value) || 0 : value;

        if (field) { // Nested property
            setFormData(prev => ({
                ...prev,
                [section]: {
                    // FIX: Cast the nested object to 'Record<string, any>' to satisfy spread type constraint.
                    // This is safe because `field` is only non-null for dot-separated names
                    // which are used for nested objects in the form.
                    ...(prev[section as keyof typeof prev] as Record<string, any>),
                    [field]: parsedValue
                }
            }));
        } else { // Top-level property
            setFormData(prev => ({ ...prev, [name]: parsedValue }));
        }
    };
    
    const handleCheckboxChange = (section: 'compliance', field: 'safetyTraining') => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: !prev[section][field] }
        }));
    }

    const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData(prev => ({...prev, skills: [...prev.skills, skillInput.trim()]}));
            }
            setSkillInput('');
        }
    };
    
    const handleSkillRemove = (skillToRemove: string) => {
        setFormData(prev => ({...prev, skills: prev.skills.filter(skill => skill !== skillToRemove)}));
    };

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    
    const calculateAge = (dob?: string) => {
        if (!dob) return '';
        try {
            const age = Math.floor((new Date().getTime() - new Date(dob).getTime()) / 31557600000);
            return age >= 0 ? `${age} years` : '';
        } catch { return ''; }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-3xl">
                 <div className="flex justify-between items-center mb-4 pb-3 border-b"><h2 className="text-xl font-bold">{isEditing ? 'Laborer Details' : 'Add New Laborer'}</h2><button type="button" onClick={onClose}><X size={24} /></button></div>
                 <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    <fieldset className="border p-4 rounded-md"><legend className="text-sm font-semibold px-2">1. Basic Information</legend><div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputGroup label="Labor ID / Code" name="laborIdCode" value={formData.laborIdCode} onChange={handleChange} required />
                            <InputGroup label="Full Name" name="basicInfo.fullName" value={formData.basicInfo.fullName} onChange={handleChange} required />
                            <InputGroup label="Father's / Husband's Name" name="basicInfo.relativeName" value={formData.basicInfo.relativeName} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputGroup label="Date of Birth" name="basicInfo.dateOfBirth" type="date" value={formData.basicInfo.dateOfBirth} onChange={handleChange} />
                            <div><label className="block text-sm font-medium text-gray-700">Age</label><input value={calculateAge(formData.basicInfo.dateOfBirth)} readOnly className="mt-1 w-full p-2 border rounded-md bg-slate-100 border-gray-300" /></div>
                            <SelectGroup label="Gender" name="basicInfo.gender" value={formData.basicInfo.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup label="Contact Number" name="basicInfo.contactNumber" value={formData.basicInfo.contactNumber} onChange={handleChange} required />
                            <InputGroup label="Aadhar / ID Proof No." name="basicInfo.idProofNumber" value={formData.basicInfo.idProofNumber} onChange={handleChange} />
                        </div>
                        <InputGroup label="Address" name="basicInfo.address" value={formData.basicInfo.address} onChange={handleChange} isTextArea />
                    </div></fieldset>

                     <fieldset className="border p-4 rounded-md"><legend className="text-sm font-semibold px-2">2. Employment Details</legend><div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputGroup label="Department / Site Name" name="employmentDetails.department" value={formData.employmentDetails.department} onChange={handleChange} />
                        <InputGroup label="Designation / Work Type" name="employmentDetails.designation" value={formData.employmentDetails.designation} onChange={handleChange} required />
                        <InputGroup label="Joining Date" name="employmentDetails.joiningDate" type="date" value={formData.employmentDetails.joiningDate} onChange={handleChange} required />
                        <InputGroup label="Contractor / Supervisor Name" name="employmentDetails.supervisor" value={formData.employmentDetails.supervisor} onChange={handleChange} />
                        <SelectGroup label="Work Shift" name="employmentDetails.workShift" value={formData.employmentDetails.workShift} onChange={handleChange} options={['Day', 'Night', 'Flexible']} />
                        <SelectGroup label="Wage Type" name="employmentDetails.wageType" value={formData.employmentDetails.wageType} onChange={handleChange} options={['Daily', 'Weekly', 'Monthly', 'Hourly']} required/>
                        <InputGroup label={`Wage Rate (${currency.symbol})`} name="employmentDetails.wageRate" type="number" value={formData.employmentDetails.wageRate} onChange={handleChange} required />
                         <SelectGroup label="Status" name="status" value={formData.status} onChange={handleChange} options={['Active', 'Inactive']} required/>
                     </div></fieldset>

                     <fieldset className="border p-4 rounded-md"><legend className="text-sm font-semibold px-2">3. Payment Details</legend><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup label="Bank Account No." name="paymentDetails.bankAccountNumber" value={formData.paymentDetails.bankAccountNumber} onChange={handleChange} />
                        <InputGroup label="UPI ID" name="paymentDetails.upiId" value={formData.paymentDetails.upiId} onChange={handleChange} />
                        <SelectGroup label="Primary Payment Mode" name="paymentDetails.paymentMode" value={formData.paymentDetails.paymentMode} onChange={handleChange} options={['Cash', 'Bank Transfer', 'UPI']} required/>
                    </div></fieldset>
                    
                    <fieldset className="border p-4 rounded-md"><legend className="text-sm font-semibold px-2">4. Compliance & Safety</legend><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup label="PF / ESI Number" name="compliance.pfEsiNumber" value={formData.compliance.pfEsiNumber} onChange={handleChange} />
                        <InputGroup label="Insurance / Policy No." name="compliance.insurancePolicyNumber" value={formData.compliance.insurancePolicyNumber} onChange={handleChange} />
                        <SelectGroup label="Medical Checkup Status" name="compliance.medicalCheckupStatus" value={formData.compliance.medicalCheckupStatus} onChange={handleChange} options={['Not Required', 'Pending', 'Completed']} />
                        <SelectGroup label="Safety Training" name="compliance.safetyTraining" value={String(formData.compliance.safetyTraining)} onChange={(e) => handleCheckboxChange('compliance', 'safetyTraining')} options={[{label:'Yes', value:'true'}, {label:'No', value:'false'}]} />
                    </div></fieldset>
                     
                    <fieldset className="border p-4 rounded-md"><legend className="text-sm font-semibold px-2">5. Remarks</legend><div className="space-y-4">
                        <InputGroup label="Performance Notes" name="remarks.performanceNotes" value={formData.remarks.performanceNotes} onChange={handleChange} isTextArea />
                        <InputGroup label="Additional Comments" name="remarks.additionalComments" value={formData.remarks.additionalComments} onChange={handleChange} isTextArea />
                    </div></fieldset>

                    <div><label className="block text-sm font-medium text-gray-700">Skills</label><div className="flex items-center mt-1"><input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleSkillAdd} className="flex-grow p-2 border rounded-md border-gray-300" placeholder="Type a skill and press Enter"/></div><div className="flex flex-wrap gap-2 mt-2">{formData.skills.map((skill) => (<span key={skill} className="flex items-center bg-primary/20 text-primary-dark text-xs font-semibold px-2.5 py-1 rounded-full">{skill}<button type="button" onClick={() => handleSkillRemove(skill)} className="ml-2 text-primary-dark/70 hover:text-primary-dark"><X size={12} /></button></span>))}</div></div>
                 </div>
                 <div className="mt-6 flex justify-end space-x-3 pt-4 border-t"><button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button><button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Save Details</button></div>
            </form>
        </div>
    )
}

const InputGroup = ({ label, name, value, onChange, type = 'text', required = false, isTextArea = false, placeholder = '' }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        {isTextArea ? (
            <textarea id={name} name={name} value={value || ''} onChange={onChange} required={required} rows={2} className="mt-1 w-full p-2 border rounded-md border-gray-300" placeholder={placeholder}></textarea>
        ) : (
            <input id={name} name={name} type={type} value={value || ''} onChange={onChange} required={required} step={type === 'number' ? 'any' : undefined} className="mt-1 w-full p-2 border rounded-md border-gray-300" placeholder={placeholder} />
        )}
    </div>
);

const SelectGroup = ({ label, name, value, onChange, options, required = false }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <select id={name} name={name} value={value || ''} onChange={onChange} required={required} className="mt-1 w-full p-2 border rounded-md bg-white border-gray-300">
             <option value="">-- Select --</option>
            {options.map((opt: any) => (
                typeof opt === 'string' ?
                <option key={opt} value={opt}>{opt}</option> :
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);


const AddPaymentModal = ({ onClose, onSave, initialData, laborers }: { 
    onClose: () => void; 
    onSave: (paymentData: Omit<FinanceEntry, 'id' | 'type' | 'category'>) => void; 
    initialData?: PrefillData | null;
    laborers: Laborer[];
}) => {
    const { currency } = useCurrency();
    const [formData, setFormData] = useState({
        date: initialData?.date || formatDate(new Date()),
        amount: initialData?.amount || 0,
        notes: initialData?.notes || '',
        laborerId: initialData?.laborerId || '',
        paymentMethod: initialData?.paymentMethod || ('Cash' as PaymentMethod),
    });
    
    const [calcTotal, setCalcTotal] = useState('');
    const [calcDays, setCalcDays] = useState('');
    const dailyWage = useMemo(() => {
        const total = parseFloat(calcTotal);
        const days = parseFloat(calcDays);
        if (total > 0 && days > 0) return total / days;
        return 0;
    }, [calcTotal, calcDays]);

     useEffect(() => {
        // Auto-populate notes for manual entry when a laborer is selected and notes are empty or default
        if (!initialData && formData.laborerId) {
            const laborerName = laborers.find(l => l.id === formData.laborerId)?.basicInfo.fullName;
            if (laborerName && (formData.notes === '' || formData.notes.startsWith('Payment for'))) {
                setFormData(prev => ({ ...prev, notes: `Payment for ${laborerName}` }));
            }
        }
    }, [formData.laborerId, initialData, laborers, formData.notes]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;
        setFormData(prev => ({...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value}))
    };
    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        if(!formData.date || formData.amount <= 0 || !formData.notes || !formData.laborerId) {
            alert("Please select a laborer and fill all required fields.");
            return;
        }
        const { laborerId, ...paymentData } = formData;
        onSave(paymentData); 
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Add Labor Payment</h2><button type="button" onClick={onClose}><X size={24} /></button></div>
                <div className="space-y-4">
                     <div>
                        <label className="text-sm font-medium text-gray-700">Laborer</label>
                        <select 
                            name="laborerId" 
                            value={formData.laborerId} 
                            onChange={handleChange} 
                            className="mt-1 w-full p-2 border rounded-md bg-white disabled:bg-slate-100 border-gray-300" 
                            required
                            disabled={!!initialData?.laborerId}
                        >
                            <option value="">-- Select a Laborer --</option>
                            {laborers.map(l => <option key={l.id} value={l.id}>{l.basicInfo.fullName}</option>)}
                        </select>
                    </div>
                    <div><label className="text-sm font-medium text-gray-700">Payment Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md border-gray-300" required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium text-gray-700">Amount ({currency.symbol})</label><input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md border-gray-300" required /></div>
                        <div>
                             <label className="text-sm font-medium text-gray-700">Payment Method</label>
                             <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white border-gray-300" required>
                                {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
                             </select>
                        </div>
                    </div>
                    <div><label className="text-sm font-medium text-gray-700">Notes</label><input type="text" name="notes" placeholder="e.g., Payment for John Doe" value={formData.notes} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md border-gray-300" required /></div>
                     
                     <div className="p-3 bg-slate-50 rounded-lg border">
                        <h3 className="text-sm font-semibold flex items-center text-slate-600 mb-2">
                            <Calculator size={14} className="mr-2"/> Daily Wage Calculator (Helper)
                        </h3>
                        <div className="flex items-center space-x-2">
                            <div className="flex-1">
                                <label className="text-xs text-slate-600">Total Wages ({currency.symbol})</label>
                                <input type="number" value={calcTotal} onChange={e => setCalcTotal(e.target.value)} className="w-full p-1.5 border rounded-md text-sm bg-white"/>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-slate-600">Days Worked</label>
                                <input type="number" value={calcDays} onChange={e => setCalcDays(e.target.value)} className="w-full p-1.5 border rounded-md text-sm bg-white"/>
                            </div>
                            <div className="flex-1 text-center pt-5">
                                <p className="text-xs text-slate-500">Calculated Daily Wage</p>
                                <p className="font-bold text-lg text-primary-dark">
                                    {dailyWage > 0 && isFinite(dailyWage) ? formatCurrency(dailyWage, currency.symbol) : formatCurrency(0, currency.symbol)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button><button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Add Payment</button></div>
            </form>
        </div>
    );
};
