import React, { useState, useEffect } from 'react';
import { getControlDevices, updateDeviceStatus, addDevice, updateDevice, getAutomationRules, updateAutomationRule, addAutomationRule, getRobots, startRobotMission, returnRobotToBase, getZonesByFarmId, addRobot, updateRobotSoftware } from '../services/mockApiService';
import type { ControlDevice, AutomationRule, RuleTriggerCondition, RuleAction, Robot, Zone } from '../types';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { Droplets, Fan, Lightbulb, Cog, Plus, X, Pencil, Camera, Zap, ToggleLeft, ToggleRight, Edit, Bot as BotIcon, Microscope, Scissors, MapPin, ShoppingCart, CloudDrizzle, ArrowUpCircle } from 'lucide-react';
import { ToggleSwitch } from './common/ToggleSwitch';

const deviceIconMap: Record<ControlDevice['type'], React.ReactNode> = {
    'Water Pump': <Droplets className="text-blue-500" size={28} />,
    'Ventilation Fan': <Fan className="text-slate-500" size={28} />,
    'Motor': <Cog className="text-orange-500" size={28} />,
    'Lighting System': <Lightbulb className="text-yellow-500" size={28} />,
};

type Tab = 'devices' | 'rules' | 'robotics';

export const AutomationControl: React.FC = () => {
    const [devices, setDevices] = useState<ControlDevice[]>([]);
    const [rules, setRules] = useState<AutomationRule[]>([]);
    const [robots, setRobots] = useState<Robot[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('devices');
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<ControlDevice | null>(null);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
    const [isShopModalOpen, setIsShopModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            getControlDevices(),
            getAutomationRules(),
            getRobots(),
            getZonesByFarmId('farm-1') // Hardcoded for now
        ]).then(([deviceData, ruleData, robotData, zoneData]) => {
            setDevices(deviceData);
            setRules(ruleData);
            setRobots(robotData);
            setZones(zoneData);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggle = (deviceId: string, currentStatus: 'On' | 'Off') => {
        const newStatus = currentStatus === 'On' ? 'Off' : 'On';
        setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: newStatus } : d));
        updateDeviceStatus(deviceId, newStatus).catch(() => fetchData()); // Re-fetch on error
    };
    
    const handleRuleToggle = (rule: AutomationRule) => {
        const updatedRule = { ...rule, isEnabled: !rule.isEnabled };
        setRules(prev => prev.map(r => r.id === rule.id ? updatedRule : r));
        updateAutomationRule(updatedRule).catch(() => fetchData()); // Re-fetch on error
    };

    const handleSaveDevice = async (data: ControlDevice | Omit<ControlDevice, 'id' | 'status' | 'lastSeen'>) => {
        'id' in data ? await updateDevice(data) : await addDevice(data);
        fetchData();
        setIsDeviceModalOpen(false);
        setEditingDevice(null);
    };
    
    const handleSaveRule = async (data: AutomationRule | Omit<AutomationRule, 'id'>) => {
        if ('id' in data) {
            await updateAutomationRule(data);
        } else {
            await addAutomationRule(data as Omit<AutomationRule, 'id'>);
        }
        fetchData();
        setIsRuleModalOpen(false);
        setEditingRule(null);
    };
    
    const handleAddRobot = async (robotData: Omit<Robot, 'id' | 'status' | 'batteryLevel' | 'activeMission'>) => {
        await addRobot(robotData);
        fetchData();
        setIsShopModalOpen(false);
        setIsAddModalOpen(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-on-surface">Automation & Control</h1>
            
            <Card>
                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('devices')} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'devices' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><Zap size={16}/><span>Device Control</span></button>
                        <button onClick={() => setActiveTab('rules')} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'rules' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><Cog size={16}/><span>Smart Rules</span></button>
                        <button onClick={() => setActiveTab('robotics')} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'robotics' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><BotIcon size={16}/><span>Robotics</span></button>
                    </nav>
                </div>
                
                {activeTab === 'devices' && <DeviceControlView devices={devices} onToggle={handleToggle} onAdd={() => { setEditingDevice(null); setIsDeviceModalOpen(true); }} onEdit={(d) => { setEditingDevice(d); setIsDeviceModalOpen(true); }} />}
                {activeTab === 'rules' && <SmartRulesView rules={rules} onToggle={handleRuleToggle} onAdd={() => { setEditingRule(null); setIsRuleModalOpen(true); }} onEdit={(r) => { setEditingRule(r); setIsRuleModalOpen(true); }} devices={devices} />}
                {activeTab === 'robotics' && <RobotControlView robots={robots} zones={zones} onUpdate={fetchData} onShop={() => setIsShopModalOpen(true)} onAdd={() => setIsAddModalOpen(true)} />}

            </Card>

            {isDeviceModalOpen && <DeviceModal device={editingDevice} onSave={handleSaveDevice} onClose={() => { setIsDeviceModalOpen(false); setEditingDevice(null); }} />}
            {isRuleModalOpen && <RuleModal rule={editingRule} devices={devices} onSave={handleSaveRule} onClose={() => setIsRuleModalOpen(false)} />}
            {isShopModalOpen && <RobotShopModal onClose={() => setIsShopModalOpen(false)} onAdd={handleAddRobot} />}
            {isAddModalOpen && <AddRobotModal zones={zones} onClose={() => setIsAddModalOpen(false)} onSave={handleAddRobot} />}
        </div>
    );
};

const DeviceControlView = ({ devices, onToggle, onAdd, onEdit }: { devices: ControlDevice[], onToggle: (id: string, status: 'On' | 'Off') => void, onAdd: () => void, onEdit: (d: ControlDevice) => void }) => (
    <>
        <div className="flex items-center justify-end mb-4">
            <button onClick={onAdd} className="flex items-center justify-center px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition"><Plus size={16} className="mr-2" />Add New Device</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {devices.map(device => (
                <DeviceCard key={device.id} device={device} onToggle={onToggle} onEdit={onEdit} />
            ))}
        </div>
    </>
);

const SmartRulesView = ({ rules, onToggle, onAdd, onEdit, devices }: { rules: AutomationRule[], onToggle: (r: AutomationRule) => void, onAdd: () => void, onEdit: (r: AutomationRule) => void, devices: ControlDevice[] }) => {
    const getDeviceName = (id: string) => devices.find(d => d.id === id)?.name || 'Unknown Device';
    
    return (
    <>
        <div className="flex items-center justify-end mb-4">
            <button onClick={onAdd} className="flex items-center justify-center px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition"><Plus size={16} className="mr-2" />Add New Rule</button>
        </div>
        <div className="space-y-4">
            {rules.map(rule => (
                <div key={rule.id} className="p-4 border rounded-lg bg-slate-50 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-on-surface">{rule.name}</p>
                        <p className="text-xs text-slate-500 mt-1">IF <span className="font-semibold text-slate-600">sensor</span> reads <span className="font-semibold text-slate-600">{rule.trigger.condition} {rule.trigger.value}</span> THEN <span className="font-semibold text-slate-600">{rule.action.type.replace('_',' ')} {getDeviceName(rule.action.targetDeviceId)}</span></p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <ToggleSwitch checked={rule.isEnabled} onChange={() => onToggle(rule)} label="" />
                        <button onClick={() => onEdit(rule)} className="p-1 text-slate-400 hover:text-slate-700"><Edit size={16}/></button>
                    </div>
                </div>
            ))}
        </div>
    </>
)};


interface DeviceCardProps {
    device: ControlDevice;
    onToggle: (deviceId: string, currentStatus: 'On' | 'Off') => void;
    onEdit: (device: ControlDevice) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onToggle, onEdit }) => {
    const isOn = device.status === 'On';
    const isControllable = device.connectionType === 'Cloud Connected';
    return (
        <Card className="flex flex-col justify-between">
            <div>
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-on-surface pr-2">{device.name}</h3>
                    {deviceIconMap[device.type]}
                </div>
                <p className="text-sm text-slate-500 mb-4">{device.location}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${isOn && isControllable ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    <span className={`font-semibold text-sm ${isOn && isControllable ? 'text-green-600' : 'text-slate-600'}`}>
                        {device.status}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                     <button onClick={() => onEdit(device)} className="p-1 text-slate-400 hover:text-slate-700"><Pencil size={16}/></button>
                     <ToggleSwitch checked={isOn} onChange={() => onToggle(device.id, device.status)} disabled={!isControllable} label="" />
                </div>
            </div>
        </Card>
    );
};

const robotIconMap: Record<Robot['type'], React.ReactNode> = {
    'Scout Rover': <Camera className="text-blue-500" size={28} />,
    'Weeding Drone': <Microscope className="text-red-500" size={28} />,
    'Harvester': <Scissors className="text-green-500" size={28} />,
    'Spraying Drone': <CloudDrizzle className="text-teal-500" size={28} />,
};

const RobotControlView = ({ robots, zones, onUpdate, onShop, onAdd }: { robots: Robot[], zones: Zone[], onUpdate: () => void, onShop: () => void, onAdd: () => void }) => (
    <>
        <div className="flex items-center justify-end mb-4 space-x-2">
             <button onClick={onShop} className="flex items-center text-sm px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition"><ShoppingCart size={16} className="mr-2"/> Shop for Robots</button>
             <button onClick={onAdd} className="flex items-center text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition"><Plus size={16} className="mr-1"/> Add Existing Robot</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {robots.map(robot => (
                <RobotCard key={robot.id} robot={robot} zones={zones} onUpdate={onUpdate} />
            ))}
        </div>
    </>
);

const RobotCard = ({ robot, zones, onUpdate }: { robot: Robot, zones: Zone[], onUpdate: () => void }) => {
    const zoneName = zones.find(z => z.id === robot.currentZoneId)?.name || 'Unknown Zone';
    
    const getBatteryColor = (level: number) => {
        if (level > 50) return 'bg-green-500';
        if (level > 20) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const statusMap: Record<Robot['status'], { color: string, text: string }> = {
        'Idle': { color: 'bg-blue-500', text: 'text-blue-600' },
        'Working': { color: 'bg-green-500', text: 'text-green-600' },
        'Charging': { color: 'bg-yellow-500', text: 'text-yellow-600' },
        'Maintenance': { color: 'bg-slate-500', text: 'text-slate-600' },
        'Error': { color: 'bg-red-500', text: 'text-red-600' },
        'Updating': { color: 'bg-purple-500', text: 'text-purple-600' },
    };

    const handleStart = () => {
        let mission: 'Scouting' | 'Weeding' | 'Harvesting' | 'Spraying';
        switch (robot.type) {
            case 'Weeding Drone':
                mission = 'Weeding';
                break;
            case 'Harvester':
                mission = 'Harvesting';
                break;
            case 'Spraying Drone':
                mission = 'Spraying';
                break;
            case 'Scout Rover':
            default:
                mission = 'Scouting';
        }
        startRobotMission(robot.id, mission).then(onUpdate);
    };

    const handleStop = () => {
        returnRobotToBase(robot.id).then(onUpdate);
    };
    
    const handleUpdateSoftware = () => {
        updateRobotSoftware(robot.id).then(onUpdate);
    }

    return (
        <Card className="flex flex-col justify-between">
            <div>
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-on-surface pr-2">{robot.name}</h3>
                    {robotIconMap[robot.type]}
                </div>
                <p className="text-sm text-slate-500 mb-1">{robot.type}</p>
                <p className="text-xs text-slate-400 mb-4">Software: {robot.softwareVersion}</p>

                {robot.updateAvailable && (
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold flex items-center mb-4">
                        <ArrowUpCircle size={14} className="mr-2"/>
                        Update Available: v1.3.0
                    </div>
                )}

                <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-600">Status</span>
                        <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${statusMap[robot.status].color} ${robot.status !== 'Idle' ? 'animate-pulse' : ''}`}></span>
                            <span className={`font-semibold ${statusMap[robot.status].text}`}>{robot.status}</span>
                        </div>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-600">Battery</span>
                        <div className="w-1/2 bg-slate-200 rounded-full h-2.5">
                            <div className={`${getBatteryColor(robot.batteryLevel)} h-2.5 rounded-full`} style={{ width: `${robot.batteryLevel}%` }}></div>
                        </div>
                        <span className="font-semibold">{robot.batteryLevel}%</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-600">Location</span>
                        <div className="flex items-center space-x-1 text-slate-600">
                           <MapPin size={14} /><span>{zoneName}</span>
                        </div>
                    </div>
                </div>

                {(robot.activeMission && robot.status !== 'Updating') && (
                    <div className="mt-4 pt-3 border-t">
                        <p className="text-sm font-semibold text-slate-700">Active Mission: {robot.activeMission.type}</p>
                         <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${robot.activeMission.progress}%` }}></div>
                        </div>
                        <p className="text-right text-xs text-slate-500 mt-1">{robot.activeMission.progress}% Complete</p>
                    </div>
                )}
                
                {robot.status === 'Updating' && (
                     <div className="mt-4 pt-3 border-t">
                        <p className="text-sm font-semibold text-purple-700">Updating Software...</p>
                         <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${robot.activeMission?.progress || 0}%` }}></div>
                        </div>
                        <p className="text-right text-xs text-slate-500 mt-1">{robot.activeMission?.progress || 0}% Complete</p>
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-col space-y-2">
                {robot.updateAvailable && robot.status === 'Idle' && (
                     <button onClick={handleUpdateSoftware} className="w-full px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition text-sm">
                        Update Software
                    </button>
                )}
                {robot.status === 'Idle' && (
                    <button onClick={handleStart} disabled={robot.batteryLevel <= 20 || robot.updateAvailable} className="w-full px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition disabled:bg-slate-400 disabled:cursor-not-allowed text-sm">
                        Start Mission
                    </button>
                )}
                {robot.status === 'Working' && (
                    <button onClick={handleStop} className="w-full px-4 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition text-sm">
                        Return to Base
                    </button>
                )}
                 {['Charging', 'Maintenance', 'Error', 'Updating'].includes(robot.status) && (
                    <button disabled className="w-full px-4 py-2 bg-slate-300 text-slate-600 font-bold rounded-md cursor-not-allowed text-sm">
                        Unavailable
                    </button>
                 )}
            </div>
        </Card>
    );
};


const DeviceModal = ({ device, onSave, onClose }: { device: ControlDevice | null, onSave: (d: any) => void, onClose: () => void }) => {
    const isEditing = !!device;
    const [formData, setFormData] = useState({
        name: device?.name || '',
        type: device?.type || 'Water Pump',
        location: device?.location || '',
        connectionType: device?.connectionType || 'Cloud Connected',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.location) {
            alert('Please fill out all fields.');
            return;
        }
        if (isEditing) {
            onSave({ ...device, ...formData });
        } else {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                    <h2 className="text-xl font-bold">{isEditing ? 'Edit Device' : 'Add New Device'}</h2>
                    <button type="button" onClick={onClose}><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Device Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Device Type</label>
                            <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                                <option>Water Pump</option>
                                <option>Ventilation Fan</option>
                                <option>Motor</option>
                                <option>Lighting System</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="connectionType" className="block text-sm font-medium text-gray-700">Connection</label>
                            <select name="connectionType" id="connectionType" value={formData.connectionType} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                                <option>Cloud Connected</option>
                                <option>Local Network Only</option>
                                <option>Unsupported</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">
                        {isEditing ? 'Save Changes' : 'Add Device'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const RuleModal = ({ rule, devices, onSave, onClose }: { 
    rule: AutomationRule | null, 
    devices: ControlDevice[], 
    onSave: (r: AutomationRule | Omit<AutomationRule, 'id'>) => void, 
    onClose: () => void 
}) => {
    const isEditing = !!rule;
    
    const [formData, setFormData] = useState<Omit<AutomationRule, 'id'>>({
        name: rule?.name || '',
        trigger: {
            type: rule?.trigger.type || 'schedule',
            condition: rule?.trigger.condition || 'time_of_day_is',
            targetId: rule?.trigger.targetId || 'scheduler',
            value: rule?.trigger.value || '22:00',
        },
        action: {
            type: rule?.action.type || 'turn_on',
            targetDeviceId: rule?.action.targetDeviceId || '',
            durationMinutes: rule?.action.durationMinutes,
        },
        isEnabled: rule?.isEnabled ?? true,
    });

    const handleTriggerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as AutomationRule['trigger']['type'];
        let newCondition: RuleTriggerCondition = 'time_of_day_is';
        let newValue: string | number = '22:00';

        if (newType === 'device_sensor') {
            newCondition = 'temperature_above';
            newValue = 30;
        }
        
        setFormData(prev => ({
            ...prev,
            trigger: { ...prev.trigger, type: newType, condition: newCondition, value: newValue }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.action.targetDeviceId) {
            alert('Please fill in the rule name and select a target device.');
            return;
        }
        
        const finalData = { ...formData };
        if (formData.action.type === 'turn_off') {
            finalData.action.durationMinutes = undefined;
        } else {
             finalData.action.durationMinutes = Number(formData.action.durationMinutes || 0);
        }

        if (isEditing) {
            onSave({ id: rule.id, ...finalData });
        } else {
            onSave(finalData);
        }
    };
    
    const triggerConditions: Record<string, {value: RuleTriggerCondition, label: string}[]> = {
        schedule: [{ value: 'time_of_day_is', label: 'Time is' }],
        device_sensor: [
            { value: 'temperature_above', label: 'Temperature is above' },
            { value: 'soil_moisture_below', label: 'Soil moisture is below' },
        ],
        weather: [], // Placeholder for future expansion
    };
    
    const isTimeInput = formData.trigger.condition === 'time_of_day_is';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-2xl">
                 <div className="flex justify-between items-center mb-4 pb-3 border-b">
                    <h2 className="text-xl font-bold">{isEditing ? 'Edit Rule' : 'Add New Rule'}</h2>
                    <button type="button" onClick={onClose}><X size={24} /></button>
                 </div>
                 <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Rule Name</label>
                        <input id="name" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="mt-1 w-full p-2 border rounded-md" placeholder="e.g., Night Irrigation for North Field"/>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-bold text-lg mb-2">IF... <span className="text-base font-normal text-slate-500">(Trigger)</span></h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                             <div>
                                <label className="text-sm font-medium">Trigger Type</label>
                                <select value={formData.trigger.type} onChange={handleTriggerTypeChange} className="mt-1 w-full p-2 border rounded-md bg-white">
                                    <option value="schedule">Schedule</option>
                                    <option value="device_sensor">Device Sensor</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Condition</label>
                                <select value={formData.trigger.condition} onChange={e => setFormData(p => ({...p, trigger: {...p.trigger, condition: e.target.value as RuleTriggerCondition}}))} className="mt-1 w-full p-2 border rounded-md bg-white">
                                    {triggerConditions[formData.trigger.type]?.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Value {isTimeInput ? '' : formData.trigger.condition === 'temperature_above' ? '(°C)' : '(%)'}</label>
                                <input type={isTimeInput ? 'time' : 'number'} value={formData.trigger.value} onChange={e => setFormData(p => ({...p, trigger: {...p.trigger, value: e.target.value}}))} required className="mt-1 w-full p-2 border rounded-md" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-bold text-lg mb-2">THEN... <span className="text-base font-normal text-slate-500">(Action)</span></h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="text-sm font-medium">Action</label>
                                <select value={formData.action.type} onChange={e => setFormData(p => ({...p, action: {...p.action, type: e.target.value as RuleAction}}))} className="mt-1 w-full p-2 border rounded-md bg-white">
                                    <option value="turn_on">Turn On</option>
                                    <option value="turn_off">Turn Off</option>
                                </select>
                            </div>
                             <div className="sm:col-span-2">
                                <label className="text-sm font-medium">Target Device</label>
                                <select value={formData.action.targetDeviceId} onChange={e => setFormData(p => ({...p, action: {...p.action, targetDeviceId: e.target.value}}))} required className="mt-1 w-full p-2 border rounded-md bg-white">
                                    <option value="">-- Select a device --</option>
                                    {devices.filter(d => d.connectionType === 'Cloud Connected').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                             {formData.action.type === 'turn_on' && (
                                <div>
                                    <label className="text-sm font-medium">Duration (minutes)</label>
                                    <input type="number" value={formData.action.durationMinutes || ''} onChange={e => setFormData(p => ({...p, action: {...p.action, durationMinutes: Number(e.target.value)}}))} className="mt-1 w-full p-2 border rounded-md" placeholder="Optional"/>
                                </div>
                            )}
                        </div>
                    </div>
                     <div>
                        <ToggleSwitch label="Rule Enabled" checked={formData.isEnabled} onChange={val => setFormData({...formData, isEnabled: val})} />
                    </div>
                 </div>
                 <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">{isEditing ? 'Save Changes' : 'Create Rule'}</button>
                 </div>
            </form>
        </div>
    );
};

const AddRobotModal = ({ onClose, onSave, zones }: { onClose: () => void, onSave: (data: any) => void, zones: Zone[] }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'Scout Rover' as Robot['type'],
        currentZoneId: zones[0]?.id || '',
        softwareVersion: 'v1.0.0', // Default initial version
        updateAvailable: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.type || !formData.currentZoneId) {
            alert('Please fill out all fields.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                    <h2 className="text-xl font-bold">Add Existing Robot</h2>
                    <button type="button" onClick={onClose}><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Robot Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="e.g. My Custom Rover" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Robot Type</label>
                            <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                                <option>Scout Rover</option>
                                <option>Weeding Drone</option>
                                <option>Harvester</option>
                                <option>Spraying Drone</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="currentZoneId" className="block text-sm font-medium text-gray-700">Initial Zone</label>
                            <select name="currentZoneId" id="currentZoneId" value={formData.currentZoneId} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                                {zones.map(zone => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Add to Fleet</button>
                </div>
            </form>
        </div>
    );
};

const RobotShopModal = ({ onClose, onAdd }: { onClose: () => void, onAdd: (data: any) => void }) => {
    const shopItems = [
        {
            name: 'AgriScout Pro',
            type: 'Scout Rover',
            description: 'Advanced scouting rover with high-res cameras for early pest detection.',
            price: '$15,000',
            icon: <Camera className="text-blue-500" size={32} />,
        },
        {
            name: 'WeedZap 3000',
            type: 'Weeding Drone',
            description: 'AI-powered drone that identifies and eliminates weeds with targeted micro-doses.',
            price: '$22,500',
            icon: <Microscope className="text-red-500" size={32} />,
        },
        {
            name: 'YieldMax Harvester',
            type: 'Harvester',
            description: 'Fully autonomous harvester for various row crops, optimizing speed and yield.',
            price: '$125,000',
            icon: <Scissors className="text-green-500" size={32} />,
        },
        {
            name: 'HydroSpray Drone',
            type: 'Spraying Drone',
            description: 'Efficiently applies fertilizers and pesticides with precision spraying technology.',
            price: '$18,000',
            icon: <CloudDrizzle className="text-teal-500" size={32} />,
        }
    ];
    
    const handleAdd = (item: typeof shopItems[0]) => {
        onAdd({
            name: item.name,
            type: item.type,
            currentZoneId: 'zone-101', // Default zone
            softwareVersion: 'v1.0.0',
            updateAvailable: false,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                    <h2 className="text-xl font-bold flex items-center"><ShoppingCart className="mr-3" /> Robot Shop</h2>
                    <button type="button" onClick={onClose}><X size={24} /></button>
                </div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {shopItems.map(item => (
                        <div key={item.name} className="p-4 border rounded-lg bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {item.icon}
                                <div>
                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                    <p className="text-sm text-slate-600">{item.description}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4 flex-shrink-0">
                                <p className="font-semibold text-lg text-primary">{item.price}</p>
                                <button onClick={() => handleAdd(item)} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition text-sm">Add to Fleet</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};