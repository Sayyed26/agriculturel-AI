
import React, { useState, useEffect } from 'react';
import { getZonesByFarmId, getCEASystems } from '../services/mockApiService';
import type { Zone, CEAControlSystem } from '../types';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { Factory, Thermometer, Droplets, Wind, Lightbulb, Sun, Settings, AlertTriangle } from 'lucide-react';

export const CEAManagement: React.FC = () => {
    const [ceaZones, setCeaZones] = useState<Zone[]>([]);
    const [ceaSystems, setCeaSystems] = useState<CEAControlSystem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Using a hardcoded farmId for this example
        Promise.all([
            getZonesByFarmId('farm-1'), 
            getCEASystems()
        ]).then(([allZones, systemsData]) => {
            const filteredZones = allZones.filter(zone => 
                zone.type === 'Greenhouse' || 
                zone.type === 'Vertical Farm Rack' || 
                zone.type === 'Aquaponics System'
            );
            setCeaZones(filteredZones);
            setCeaSystems(systemsData);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-on-surface">Controlled Environments</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {ceaZones.map(zone => {
                     const system = ceaSystems.find(s => s.zoneId === zone.id);
                     if (!system) return null;

                     const hasAlert = system.nutrientSolution.ph > 6.5 || system.hvac.temperature > 25;

                     return (
                        <Card key={zone.id} className={`transition-all ${hasAlert ? 'border-2 border-red-400' : ''}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold flex items-center">
                                        <Factory size={20} className="mr-2 text-primary"/>
                                        {zone.name}
                                    </h2>
                                    <p className="text-sm text-slate-500 ml-8">{zone.type}</p>
                                </div>
                                <button className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-full">
                                    <Settings size={18} />
                                </button>
                            </div>

                            {hasAlert && (
                                <div className="flex items-center text-sm text-red-600 bg-red-100 p-2 rounded-md my-4">
                                    <AlertTriangle size={16} className="mr-2"/>
                                    <span>System parameters are outside optimal range!</span>
                                </div>
                            )}
                            
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Section title="Climate (HVAC)">
                                    <Param icon={<Thermometer size={16}/>} label="Temp" value={`${system.hvac.temperature}°C`} />
                                    <Param icon={<Droplets size={16}/>} label="Humidity" value={`${system.hvac.humidity}%`} />
                                    <Param icon={<Wind size={16}/>} label="CO₂" value={`${system.hvac.co2Level} ppm`} />
                                </Section>

                                <Section title="Lighting">
                                    <Param icon={<Lightbulb size={16}/>} label="Status" value={system.lighting.status} statusColor={system.lighting.status === 'On' ? 'text-green-500' : 'text-slate-500'} />
                                    <Param icon={<Sun size={16}/>} label="Photoperiod" value={`${system.lighting.dailyPhotoperiod}h`} />
                                    <Param icon={<Sun size={16}/>} label="Intensity" value={`${system.lighting.intensity}%`} />
                                </Section>

                                <Section title="Nutrient Solution" className="sm:col-span-2">
                                     <Param icon={<Droplets size={16} className="text-purple-500"/>} label="pH" value={system.nutrientSolution.ph.toFixed(1)} />
                                     <Param icon={<Wind size={16} className="text-blue-500" />} label="EC" value={`${system.nutrientSolution.electricalConductivity} mS/cm`} />
                                     <Param icon={<Thermometer size={16} className="text-orange-500"/>} label="Temp" value={`${system.nutrientSolution.temperature}°C`} />
                                </Section>
                            </div>
                        </Card>
                     )
                 })}
            </div>
             {ceaZones.length === 0 && (
                <Card className="text-center py-16">
                    <p className="text-slate-500">No Controlled Environment Agriculture zones have been set up.</p>
                </Card>
             )}
        </div>
    );
};


const Section: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
    <div className={`p-4 bg-slate-50 rounded-lg ${className}`}>
        <h3 className="font-semibold text-sm mb-3 text-slate-700">{title}</h3>
        <div className="grid grid-cols-3 gap-2">
            {children}
        </div>
    </div>
);

const Param: React.FC<{icon: React.ReactNode, label: string, value: string | number, statusColor?: string}> = ({icon, label, value, statusColor = 'text-on-surface'}) => (
    <div className="text-center">
        <div className="mx-auto text-slate-500 w-6 h-6 flex items-center justify-center">{icon}</div>
        <p className={`text-sm font-bold ${statusColor}`}>{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
    </div>
);
