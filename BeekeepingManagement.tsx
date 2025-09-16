
import React, { useState, useEffect } from 'react';
import { getApiaries, getHives } from '../services/mockApiService';
import type { Apiary, Hive } from '../types';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { Hexagon, Plus, Sun, Wind, Thermometer, AlertTriangle } from 'lucide-react';

export const BeekeepingManagement: React.FC = () => {
    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [hives, setHives] = useState<Hive[]>([]);
    const [selectedApiaryId, setSelectedApiaryId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([getApiaries(), getHives()]).then(([apiaryData, hiveData]) => {
            setApiaries(apiaryData);
            setHives(hiveData);
            if (apiaryData.length > 0) {
                setSelectedApiaryId(apiaryData[0].id);
            }
            setLoading(false);
        });
    }, []);

    const filteredHives = hives.filter(hive => hive.apiaryId === selectedApiaryId);

    const statusColors: Record<Hive['status'], { bg: string, text: string, border: string }> = {
        'Healthy': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
        'Weak': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
        'Queenless': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
        'Swarmed': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-on-surface">Beekeeping Management</h1>

            <Card>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                    <div>
                        <label htmlFor="apiary-select" className="block text-sm font-medium text-gray-700">Select Apiary</label>
                        <select
                            id="apiary-select"
                            value={selectedApiaryId}
                            onChange={e => setSelectedApiaryId(e.target.value)}
                            className="mt-1 block w-full sm:w-72 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        >
                            {apiaries.map(apiary => <option key={apiary.id} value={apiary.id}>{apiary.name}</option>)}
                        </select>
                    </div>
                     <button className="flex items-center justify-center px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition self-end">
                        <Plus size={16} className="mr-2" />Add Hive
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredHives.map(hive => {
                        const statusColor = statusColors[hive.status];
                        return (
                            <Card key={hive.id} className={`!p-4 border-l-4 ${statusColor.border}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg">{hive.identifier}</h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>
                                        {hive.status}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-600 mt-2 space-y-1">
                                    <p><strong>Species:</strong> {hive.species}</p>
                                    <p><strong>Queen Born:</strong> {hive.queenBirthDate}</p>
                                    <p><strong>Last Inspected:</strong> {hive.lastInspectionDate || 'N/A'}</p>
                                </div>
                            </Card>
                        )
                    })}
                </div>
                 {filteredHives.length === 0 && <p className="text-center text-slate-500 py-8">No hives in this apiary.</p>}
            </Card>
        </div>
    );
};
