
import React, { useState, useEffect } from 'react';
import { getFarms, getZonesByFarmId, addFarm, updateFarm, addZone, updateZone, getCropRotationPlans } from '../services/mockApiService';
import type { Farm, Zone, Crop, CropRotationPlan, ZoneType } from '../types';
import { Card } from './common/Card';
import { Maximize, Calendar, Hash, X, Plus, Pencil, RefreshCw, MapPin, Wind, Trees, Wheat, Tent } from 'lucide-react';
import { Spinner } from './common/Spinner';

type Tab = 'zones' | 'rotation';

const zoneTypes: ZoneType[] = ['Open Field', 'Greenhouse', 'Pasture', 'Agroforestry Plot', 'Aquaponics System', 'Vertical Farm Rack', 'Silvopasture'];

const zoneTypeIcons: Record<ZoneType, React.ReactNode> = {
    'Open Field': <Wheat size={14} className="text-yellow-600" />,
    'Greenhouse': <Tent size={14} className="text-green-600" />,
    'Pasture': <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lime-600"><path d="M17.5 2.5a2.5 2.5 0 0 1 0 5c-1 0-1.9.6-2.5 1.5-1.5 2.5-1.5 6-2.5 8s-2 3.5-3.5 3.5-2.5-1-2.5-2.5 1-2.5 2.5-2.5s2.5 1.5 2.5 2.5c0 .5-.2 1-.5 1.5-1 1-1.5 2.5-1.5 3.5 0 1.5 1 2.5 2.5 2.5s2.5-1 3.5-2.5c1-1.5 1.5-3.5 1.5-5 .5-1.5 2-2.5 3-2.5a2.5 2.5 0 0 1 0-5Z"/></svg>,
    'Agroforestry Plot': <Trees size={14} className="text-emerald-700" />,
    'Aquaponics System': <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600"><path d="M16.3 16.3 19 19l-2.7-2.7"/><path d="m11.5 3-2.5 5.5 5.5-2.5-5.5-3z"/><path d="M3 21h18"/><path d="M7 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M12.5 10.5c-1-2.5-3.5-3.5-6-2s-3.5 3.5-2 6 3.5 3.5 6 2c1.1-.7 1.9-1.6 2.5-2.5"/><path d="M15 15c.5-1.5 0-3-1.5-4.5S10 8 10 9.5s1.5 3.5 3 4.5 2.5 1 2-1Z"/></svg>,
    'Vertical Farm Rack': <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M9 3H5a2 2 0 0 0-2 2v4h6V3z"/><path d="M19 3h-4v6h6V5a2 2 0 0 0-2-2z"/><path d="M9 12H3v4a2 2 0 0 0 2 2h4v-6z"/><path d="M19 12h-6v6h4a2 2 0 0 0 2-2v-4z"/></svg>,
    'Silvopasture': <Trees size={14} className="text-green-800" />,
}

export const OperationsManagement: React.FC = () => {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [rotationPlans, setRotationPlans] = useState<CropRotationPlan[]>([]);
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('zones');

    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [isAddFarmModalOpen, setIsAddFarmModalOpen] = useState(false);
    const [isAddZoneModalOpen, setIsAddZoneModalOpen] = useState(false);
    const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

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
                getZonesByFarmId(selectedFarm.id),
                getCropRotationPlans(selectedFarm.id)
            ]).then(([zonesData, rotationData]) => {
                setZones(zonesData);
                setRotationPlans(rotationData);
                setLoading(false);
            });
        }
    }, [selectedFarm]);

    const handleSaveZone = async (updatedZone: Zone) => {
        const result = await updateZone(updatedZone);
        setZones(prevZones =>
            prevZones.map(f => (f.id === result.id ? result : f))
        );
        setEditingZone(null);
    };

    const handleAddFarm = async (farmData: Omit<Farm, 'id'>) => {
        const newFarm = await addFarm(farmData);
        setFarms(prev => [...prev, newFarm]);
        setSelectedFarm(newFarm);
        setIsAddFarmModalOpen(false);
    };

    const handleUpdateFarm = async (updatedFarm: Farm) => {
        const result = await updateFarm(updatedFarm);
        setFarms(prev => prev.map(f => f.id === result.id ? result : f));
        if (selectedFarm?.id === result.id) {
            setSelectedFarm(result);
        }
        setEditingFarm(null);
    };

    const handleAddZone = async (zoneData: { name: string; area: number, type: ZoneType }) => {
        if (!selectedFarm) return;
        const newZoneData: Omit<Zone, 'id'> = {
            ...zoneData,
            farmId: selectedFarm.id,
            crop: null,
            polygon: '',
        };
        const newZone = await addZone(newZoneData);
        setZones(prev => [...prev, newZone]);
        setIsAddZoneModalOpen(false);
    };

    const handleModalSave = (data: Farm | Omit<Farm, 'id'>) => {
        if ('id' in data) {
            handleUpdateFarm(data);
        } else {
            handleAddFarm(data);
        }
    };


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-on-surface">Operations Management</h1>
            <div className="flex flex-wrap items-center gap-2">
                {farms.map(farm => (
                    <button
                        key={farm.id}
                        onClick={() => setSelectedFarm(farm)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${selectedFarm?.id === farm.id ? 'bg-primary text-white shadow' : 'bg-surface text-secondary hover:bg-green-100'}`}
                    >
                        {farm.name}
                    </button>
                ))}
                 <button
                    onClick={() => setIsAddFarmModalOpen(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                    title="Add New Farm"
                >
                    <Plus size={20} />
                </button>
            </div>

            {selectedFarm && (
                <Card>
                     <div className="border-b border-gray-200 mb-4">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('zones')} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'zones' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><MapPin size={16}/><span>Zone Overview</span></button>
                            <button onClick={() => setActiveTab('rotation')} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'rotation' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><RefreshCw size={16}/><span>Rotation Planner</span></button>
                        </nav>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-48"><Spinner /></div>
                    ) : (
                        <>
                        {activeTab === 'zones' && <ZoneOverview zones={zones} onAddZone={() => setIsAddZoneModalOpen(true)} onEditZone={setEditingZone} onEditFarm={() => setEditingFarm(selectedFarm)} farmName={selectedFarm.name} farmLocation={selectedFarm.location} />}
                        {activeTab === 'rotation' && <RotationPlanner plans={rotationPlans} />}
                        </>
                    )}
                </Card>
            )}

            {editingZone && (
                <EditZoneModal
                    zone={editingZone}
                    onClose={() => setEditingZone(null)}
                    onSave={handleSaveZone}
                />
            )}
            
            {(isAddFarmModalOpen || editingFarm) && (
                <FarmModal
                    farm={editingFarm}
                    onClose={() => {
                        setIsAddFarmModalOpen(false);
                        setEditingFarm(null);
                    }}
                    onSave={handleModalSave}
                />
            )}

            {isAddZoneModalOpen && <AddZoneModal onClose={() => setIsAddZoneModalOpen(false)} onSave={handleAddZone} />}

        </div>
    );
};


const ZoneOverview = ({ zones, onAddZone, onEditZone, onEditFarm, farmName, farmLocation }: { zones: Zone[], onAddZone: () => void, onEditZone: (f: Zone) => void, onEditFarm: () => void, farmName: string, farmLocation: string }) => (
    <>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
                <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-semibold">{farmName} - Zones</h2>
                    <button onClick={onEditFarm} className="text-slate-500 hover:text-slate-800 p-1 rounded-full" title="Edit Farm Details">
                        <Pencil size={16} />
                    </button>
                </div>
                <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(farmLocation)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center mt-1 group"
                >
                    <MapPin size={14} className="mr-1.5 text-slate-400 group-hover:text-primary transition-colors" />
                    {farmLocation}
                </a>
            </div>
            <button onClick={onAddZone} className="flex items-center text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition self-end">
                <Plus size={16} className="mr-1"/> Add Zone
            </button>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map(zone => (
                <div key={zone.id} className="p-4 border rounded-lg bg-slate-50 space-y-3">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-primary-dark">{zone.name}</h3>
                        <div className="flex items-center text-xs font-semibold text-slate-600 bg-slate-200 px-2 py-1 rounded-full">
                           {zoneTypeIcons[zone.type]} <span className="ml-1.5">{zone.type}</span>
                        </div>
                    </div>
                    <div className="text-sm text-slate-600 space-y-2">
                        <p className="flex items-center"><Maximize size={14} className="mr-2"/>{zone.area} Acres</p>
                        {zone.crop ? (
                            <>
                            <p className="flex items-center"><Hash size={14} className="mr-2"/>Crop: <span className="font-semibold ml-1">{zone.crop.name} ({zone.crop.variety})</span></p>
                            <p className="flex items-center"><Calendar size={14} className="mr-2"/>Sown: {zone.crop.sowingDate}</p>
                            </>
                        ) : (
                            <p className="text-slate-500 italic">No crop planted</p>
                        )}
                    </div>
                    <button onClick={() => onEditZone(zone)} className="w-full text-sm mt-2 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 transition">View Details</button>
                </div>
            ))}
        </div>
    </>
);

const RotationPlanner = ({ plans }: { plans: CropRotationPlan[] }) => (
     <div>
        <h2 className="text-xl font-semibold mb-4">Strategic Crop Rotation Plan</h2>
        <div className="space-y-6">
            {plans.map(plan => (
                <div key={plan.id}>
                    <h3 className="font-bold text-lg text-primary-dark mb-2">{plan.zoneName}</h3>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-3 text-left font-semibold text-slate-600">Year</th>
                                    <th className="p-3 text-left font-semibold text-slate-600">Planned Crop</th>
                                    <th className="p-3 text-left font-semibold text-slate-600">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plan.years.map(yearData => (
                                    <tr key={yearData.year} className="border-t">
                                        <td className="p-3 font-semibold">{yearData.year}</td>
                                        <td className="p-3">{yearData.crop}</td>
                                        <td className="p-3 text-slate-500 italic">{yearData.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


interface EditZoneModalProps {
    zone: Zone;
    onClose: () => void;
    onSave: (zone: Zone) => void;
}

const EditZoneModal: React.FC<EditZoneModalProps> = ({ zone, onClose, onSave }) => {
    const [formData, setFormData] = useState<Zone>(zone);

    useEffect(() => {
        setFormData(zone);
    }, [zone]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = (e.target as HTMLInputElement).type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
    };

    const handleCropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (formData.crop) {
            setFormData(prev => ({
                ...prev,
                crop: { ...prev.crop!, [name]: value },
            }));
        }
    };
    
    const addCrop = () => {
        const newCrop: Crop = {
            id: `crop-${Date.now()}`,
            name: '',
            variety: '',
            sowingDate: '',
            expectedHarvest: '',
        };
        setFormData(prev => ({ ...prev, crop: newCrop }));
    };

    const removeCrop = () => {
        setFormData(prev => ({...prev, crop: null}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg" role="dialog" aria-modal="true" aria-labelledby="edit-zone-title">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h2 id="edit-zone-title" className="text-xl font-bold">Edit Zone: {zone.name}</h2>
                        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close modal">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Zone Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="area" className="block text-sm font-medium text-gray-700">Area (Acres)</label>
                                <input type="number" name="area" id="area" value={formData.area} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Zone Type</label>
                                <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                    {zoneTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="polygon" className="block text-sm font-medium text-gray-700">Zone Polygon</label>
                            <textarea name="polygon" id="polygon" value={formData.polygon} onChange={handleChange} rows={3} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Enter polygon data as a string (e.g., GeoJSON coordinates)"></textarea>
                        </div>
                        
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Crop Details</h3>
                            {formData.crop ? (
                                <div className="space-y-4 bg-slate-50 p-4 rounded-md">
                                    <div>
                                        <label htmlFor="crop-name" className="block text-sm font-medium text-gray-700">Crop Name</label>
                                        <input type="text" name="name" id="crop-name" value={formData.crop.name} onChange={handleCropChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="crop-variety" className="block text-sm font-medium text-gray-700">Variety</label>
                                        <input type="text" name="variety" id="crop-variety" value={formData.crop.variety} onChange={handleCropChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="sowingDate" className="block text-sm font-medium text-gray-700">Sowing Date</label>
                                        <input type="date" name="sowingDate" id="sowingDate" value={formData.crop.sowingDate} onChange={handleCropChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                    </div>
                                     <div>
                                        <label htmlFor="expectedHarvest" className="block text-sm font-medium text-gray-700">Expected Harvest</label>
                                        <input type="date" name="expectedHarvest" id="expectedHarvest" value={formData.crop.expectedHarvest} onChange={handleCropChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                    </div>
                                    <button type="button" onClick={removeCrop} className="text-sm text-red-600 hover:text-red-800">Remove Crop</button>
                                </div>
                            ) : (
                                <div className="text-center p-4 border-2 border-dashed rounded-md">
                                    <p className="text-slate-500 mb-2">No crop assigned to this zone.</p>
                                    <button type="button" onClick={addCrop} className="px-3 py-1.5 text-sm rounded-md font-semibold bg-green-100 text-primary-dark hover:bg-green-200">
                                        Add Crop
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-md font-semibold bg-primary text-white hover:bg-primary-dark">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface FarmModalProps {
    farm?: Farm | null;
    onClose: () => void;
    onSave: (farm: Farm | Omit<Farm, 'id'>) => void;
}

const FarmModal: React.FC<FarmModalProps> = ({ farm, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: farm?.name || '',
        owner: farm?.owner || '',
        location: farm?.location || '',
        area: farm?.area || 0,
    });
    const isEditing = !!farm;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(isEditing ? { ...farm!, ...formData } : formData);
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg">
                 <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">{isEditing ? 'Edit Farm' : 'Add New Farm'}</h2><button type="button" onClick={onClose}><X size={24} /></button></div>
                 <div className="space-y-4">
                    <div><label htmlFor="farm-name" className="block text-sm font-medium text-gray-700">Farm Name</label><input id="farm-name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div><label htmlFor="farm-owner" className="block text-sm font-medium text-gray-700">Owner</label><input id="farm-owner" name="owner" value={formData.owner} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div><label htmlFor="farm-location" className="block text-sm font-medium text-gray-700">Location</label><input id="farm-location" name="location" value={formData.location} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div><label htmlFor="farm-area" className="block text-sm font-medium text-gray-700">Total Area (Acres)</label><input id="farm-area" name="area" type="number" value={formData.area} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" /></div>
                 </div>
                 <div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button><button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Save</button></div>
            </form>
        </div>
    )
}

interface AddZoneModalProps {
    onClose: () => void;
    onSave: (zoneData: { name: string; area: number; type: ZoneType }) => void;
}

const AddZoneModal: React.FC<AddZoneModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [area, setArea] = useState(0);
    const [type, setType] = useState<ZoneType>('Open Field');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || area <= 0) {
            alert("Please provide a valid name and area.");
            return;
        }
        onSave({ name, area, type });
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg">
                 <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Add New Zone</h2><button type="button" onClick={onClose}><X size={24} /></button></div>
                 <div className="space-y-4">
                    <div><label htmlFor="zone-name" className="block text-sm font-medium text-gray-700">Zone Name</label><input id="zone-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div><label htmlFor="zone-area" className="block text-sm font-medium text-gray-700">Area (Acres)</label><input id="zone-area" type="number" value={area} onChange={e => setArea(parseFloat(e.target.value) || 0)} required className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div>
                        <label htmlFor="zone-type" className="block text-sm font-medium text-gray-700">Zone Type</label>
                        <select id="zone-type" value={type} onChange={e => setType(e.target.value as ZoneType)} required className="mt-1 w-full p-2 border rounded-md bg-white">
                            {zoneTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                 </div>
                 <div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button><button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Add Zone</button></div>
            </form>
        </div>
    )
}
