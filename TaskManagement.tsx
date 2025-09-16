
import React, { useState, useEffect, useMemo } from 'react';
import { getFarms, getTasksByFarmId, addTask, updateTask, getZonesByFarmId } from '../services/mockApiService';
import type { Farm, Zone, Task, TaskCategory } from '../types';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { Plus, X, Download, Filter, ArrowUpDown, Pencil } from 'lucide-react';

type SortConfig = {
    key: keyof Task;
    direction: 'ascending' | 'descending';
} | null;

const taskCategories: TaskCategory[] = [
    'General', 'Planting', 'Irrigation', 'Fertilizing', 'Pest Control', 'Harvesting', 
    'Maintenance', 'Scouting', 'Apiary Work', 'Aquaculture', 'CEA Management', 
    'Agroforestry', 'Soil Health', 'Organic Practices'
];

const categoryColors: Record<TaskCategory, string> = {
    'Harvesting': 'bg-green-100 text-green-800',
    'Planting': 'bg-blue-100 text-blue-800',
    'Irrigation': 'bg-cyan-100 text-cyan-800',
    'Fertilizing': 'bg-yellow-100 text-yellow-800',
    'Pest Control': 'bg-red-100 text-red-800',
    'Maintenance': 'bg-indigo-100 text-indigo-800',
    'Scouting': 'bg-purple-100 text-purple-800',
    'General': 'bg-slate-100 text-slate-800',
    'Apiary Work': 'bg-amber-100 text-amber-800',
    'Aquaculture': 'bg-sky-100 text-sky-800',
    'CEA Management': 'bg-fuchsia-100 text-fuchsia-800',
    'Agroforestry': 'bg-emerald-100 text-emerald-800',
    'Soil Health': 'bg-orange-100 text-orange-800',
    'Organic Practices': 'bg-lime-100 text-lime-800',
};

export const TaskManagement: React.FC = () => {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [filters, setFilters] = useState({ status: 'All', assignee: 'All', category: 'All' });
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'dueDate', direction: 'ascending'});

    useEffect(() => {
        getFarms().then(data => {
            setFarms(data);
            if (data.length > 0) {
                setSelectedFarm(data[0]);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedFarm) {
            setLoading(true);
            Promise.all([
                getTasksByFarmId(selectedFarm.id),
                getZonesByFarmId(selectedFarm.id),
            ]).then(([taskData, zoneData]) => {
                setTasks(taskData);
                setZones(zoneData);
                setLoading(false);
            });
        }
    }, [selectedFarm]);

    const assignees = useMemo(() => ['All', ...Array.from(new Set(tasks.map(t => t.assignee)))], [tasks]);
    const categoriesInUse = useMemo(() => ['All', ...Array.from(new Set(tasks.map(t => t.category)))], [tasks]);


    const filteredAndSortedTasks = useMemo(() => {
        let sortedTasks = [...tasks];
        
        if (sortConfig !== null) {
            sortedTasks.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        
        return sortedTasks.filter(task => {
            const statusMatch = filters.status === 'All' || task.status === filters.status;
            const assigneeMatch = filters.assignee === 'All' || task.assignee === filters.assignee;
            const categoryMatch = filters.category === 'All' || task.category === filters.category;
            return statusMatch && assigneeMatch && categoryMatch;
        });
    }, [tasks, filters, sortConfig]);
    
    const requestSort = (key: keyof Task) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Task) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown size={14} className="ml-1 opacity-30 inline-block" />;
        }
        return sortConfig.direction === 'ascending' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
    };

    const handleSaveTask = async (taskData: Task | Omit<Task, 'id'>) => {
        if ('id' in taskData) { // Editing existing task
            const result = await updateTask(taskData);
            setTasks(prev => prev.map(t => t.id === result.id ? result : t));
        } else { // Adding new task
            if (!selectedFarm) return;
            const taskWithFarm = { ...taskData, farmId: selectedFarm.id };
            const newTask = await addTask(taskWithFarm);
            setTasks(prev => [...prev, newTask]);
        }
        setIsModalOpen(false);
        setEditingTask(null);
    };
    
    const handleUpdateTaskStatus = async (updatedTask: Task) => {
        const result = await updateTask(updatedTask);
        setTasks(prev => prev.map(t => t.id === result.id ? result : t));
    };

    const handleOpenModal = (task: Task | null) => {
        if (task) {
            setEditingTask(task);
        } else {
            setIsModalOpen(true);
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    }

    const handleExport = () => {
        const dataToExport = filteredAndSortedTasks.map(task => ({
            Task: task.title,
            Category: task.category,
            Zone: zones.find(f => f.id === task.zoneId)?.name || 'N/A',
            Assignee: task.assignee,
            'Due Date': task.dueDate,
            Status: task.status,
            'Estimated Yield': task.estimatedYield ? `${task.estimatedYield.value} ${task.estimatedYield.unit}`: 'N/A',
            'Actual Yield': task.actualYield ? `${task.actualYield.value} ${task.actualYield.unit}`: 'N/A',
        }));

        if (dataToExport.length === 0) {
            alert("No tasks to export.");
            return;
        };
        
        const headers = Object.keys(dataToExport[0]);
        const csvContent = [
            headers.join(','),
            ...dataToExport.map(row => headers.map(header => {
                const cell = row[header as keyof typeof row];
                return typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `tasks-${selectedFarm?.name.replace(' ', '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold text-on-surface">Task Management</h1>
            </div>
            
            <div className="flex items-center space-x-2">
                {farms.map(farm => (
                    <button
                        key={farm.id}
                        onClick={() => setSelectedFarm(farm)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${selectedFarm?.id === farm.id ? 'bg-primary text-white shadow' : 'bg-surface text-secondary hover:bg-green-100'}`}>
                        {farm.name}
                    </button>
                ))}
            </div>

             <Card className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                     <div className="flex items-center text-sm font-semibold text-slate-600 sm:col-span-4 lg:col-span-1"><Filter size={16} className="mr-2"/> Filters:</div>
                    <div className="flex-grow">
                        <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
                        <select id="status-filter" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-full text-sm p-2 border rounded-md bg-white">
                            <option value="All">All Statuses</option>
                            <option value="To-Do">To-Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                     <div className="flex-grow">
                        <label htmlFor="category-filter" className="sr-only">Filter by Category</label>
                         <select id="category-filter" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="w-full text-sm p-2 border rounded-md bg-white">
                            {categoriesInUse.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                        </select>
                    </div>
                    <div className="flex-grow">
                        <label htmlFor="assignee-filter" className="sr-only">Filter by Assignee</label>
                         <select id="assignee-filter" value={filters.assignee} onChange={e => setFilters({...filters, assignee: e.target.value})} className="w-full text-sm p-2 border rounded-md bg-white">
                            {assignees.map(a => <option key={a} value={a}>{a === 'All' ? 'All Assignees' : a}</option>)}
                        </select>
                    </div>
                     <div className="sm:col-span-2 lg:col-span-4 lg:ml-auto flex items-center justify-end space-x-2">
                         <button onClick={handleExport} className="flex items-center text-sm px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 transition">
                            <Download size={14} className="mr-2"/> Export CSV
                        </button>
                         <button
                            onClick={() => handleOpenModal(null)}
                            disabled={!selectedFarm}
                            className="flex items-center justify-center px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition disabled:bg-slate-400 disabled:cursor-not-allowed">
                            <Plus size={16} className="mr-1" />
                            Add Task
                        </button>
                    </div>
                </div>
            </Card>

            <Card>
                 {loading ? (
                    <div className="flex justify-center items-center h-48"><Spinner /></div>
                ) : filteredAndSortedTasks.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="bg-slate-50 text-xs uppercase text-slate-700">
                                <tr>
                                    <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('title')}>Task{getSortIcon('title')}</th>
                                    <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('category')}>Category{getSortIcon('category')}</th>
                                    <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('zoneId')}>Zone{getSortIcon('zoneId')}</th>
                                    <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('assignee')}>Assignee{getSortIcon('assignee')}</th>
                                    <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('dueDate')}>Due Date{getSortIcon('dueDate')}</th>
                                    <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('status')}>Status{getSortIcon('status')}</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                           </thead>
                            <tbody>
                                {filteredAndSortedTasks.map(task => (
                                    <TaskRow key={task.id} task={task} zones={zones} onStatusUpdate={handleUpdateTaskStatus} onEdit={handleOpenModal} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-center text-slate-500 py-8">No tasks match the current filters.</p>}
            </Card>

            {(isModalOpen || editingTask) && selectedFarm && (
                <TaskModal
                    task={editingTask}
                    farmId={selectedFarm.id}
                    zones={zones}
                    onClose={handleCloseModal}
                    onSave={handleSaveTask}
                />
            )}
        </div>
    );
};

interface TaskRowProps {
    task: Task;
    zones: Zone[];
    onStatusUpdate: (task: Task) => void;
    onEdit: (task: Task) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, zones, onStatusUpdate, onEdit }) => {
    const statusColors: Record<Task['status'], string> = {
        'To-Do': 'bg-slate-200 text-slate-800 hover:bg-slate-300',
        'In Progress': 'bg-blue-200 text-blue-800 hover:bg-blue-300',
        'Completed': 'bg-green-200 text-green-800 hover:bg-green-300'
    };
    
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onStatusUpdate({ ...task, status: e.target.value as Task['status'] });
    };

    const zoneName = zones.find(f => f.id === task.zoneId)?.name || 'N/A';

    return (
        <tr className="border-b hover:bg-slate-50">
            <td className="px-4 py-3 font-medium">{task.title}</td>
            <td className="px-4 py-3"><span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${categoryColors[task.category]}`}>{task.category}</span></td>
            <td className="px-4 py-3 text-slate-600">{zoneName}</td>
            <td className="px-4 py-3 text-slate-600">{task.assignee}</td>
            <td className="px-4 py-3 text-slate-600">{task.dueDate}</td>
            <td className="px-4 py-3">
                 <select
                    value={task.status}
                    onChange={handleStatusChange}
                    className={`text-xs font-semibold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-primary/50 transition-colors ${statusColors[task.status]}`}>
                    <option value="To-Do">To-Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
            </td>
            <td className="px-4 py-3">
                <button onClick={() => onEdit(task)} className="p-1 text-slate-500 hover:text-primary rounded-full hover:bg-slate-200 transition">
                    <Pencil size={16} />
                </button>
            </td>
        </tr>
    );
};

interface TaskModalProps {
    task: Task | null;
    farmId: string;
    zones: Zone[];
    onClose: () => void;
    onSave: (taskData: Task | Omit<Task, 'id'>) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, farmId, zones, onClose, onSave }) => {
    const isEditing = !!task;
    const [formData, setFormData] = useState({
        title: task?.title || '',
        assignee: task?.assignee || '',
        dueDate: task?.dueDate || '',
        zoneId: task?.zoneId || undefined,
        status: task?.status || 'To-Do',
        category: task?.category || 'General',
        estimatedYield: task?.estimatedYield || { value: 0, unit: 'tons' },
        actualYield: task?.actualYield || { value: 0, unit: 'tons' },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleYieldChange = (e: React.ChangeEvent<HTMLInputElement>, yieldType: 'estimatedYield' | 'actualYield') => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [yieldType]: {
                ...prev[yieldType],
                [name]: name === 'value' ? parseFloat(value) || 0 : value,
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.title || !formData.assignee || !formData.dueDate) return;
        
        let dataToSave: any = {...formData};
        if (formData.category !== 'Harvesting') {
            delete dataToSave.estimatedYield;
            delete dataToSave.actualYield;
        }

        if (isEditing) {
            onSave({ ...task, ...dataToSave });
        } else {
            onSave(dataToSave);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center mb-4 pb-3 border-b">
                        <h2 id="task-modal-title" className="text-xl font-bold">{isEditing ? 'Edit Task' : 'Add New Task'}</h2>
                        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close modal">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Task Title</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                    {taskCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="zoneId" className="block text-sm font-medium text-gray-700">Zone (Optional)</label>
                                <select name="zoneId" id="zoneId" value={formData.zoneId || ''} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                    <option value="">General (No specific zone)</option>
                                    {zones.map(zone => (
                                        <option key={zone.id} value={zone.id}>{zone.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">Assignee</label>
                                <input type="text" name="assignee" id="assignee" value={formData.assignee} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                            </div>
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                                <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                            </div>
                        </div>

                        {formData.category === 'Harvesting' && (
                             <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-md font-semibold text-gray-800">Harvest Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Estimated Yield</label>
                                        <div className="flex items-center mt-1">
                                            <input type="number" name="value" value={formData.estimatedYield.value} onChange={(e) => handleYieldChange(e, 'estimatedYield')} className="w-2/3 p-2 border-gray-300 border rounded-l-md" />
                                            <input type="text" name="unit" value={formData.estimatedYield.unit} onChange={(e) => handleYieldChange(e, 'estimatedYield')} className="w-1/3 p-2 border-gray-300 border-l-0 border rounded-r-md bg-slate-50" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Actual Yield</label>
                                        <div className="flex items-center mt-1">
                                            <input type="number" name="value" value={formData.actualYield.value} onChange={(e) => handleYieldChange(e, 'actualYield')} className="w-2/3 p-2 border-gray-300 border rounded-l-md" />
                                            <input type="text" name="unit" value={formData.actualYield.unit} onChange={(e) => handleYieldChange(e, 'actualYield')} className="w-1/3 p-2 border-gray-300 border-l-0 border rounded-r-md bg-slate-50" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-md font-semibold bg-primary text-white hover:bg-primary-dark">
                           {isEditing ? 'Save Changes' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
