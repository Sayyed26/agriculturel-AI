
import React, { useState, useEffect } from 'react';
import { getFarms, getZonesByFarmId, getSoilTestByZoneId, getWeather } from '../services/mockApiService';
import type { Farm, Zone, SoilTest, WeatherData } from '../types';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { Droplets, Thermometer, Wind, Upload, CheckCircle } from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

export const SoilAndWeather: React.FC = () => {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [selectedFarmId, setSelectedFarmId] = useState<string>('');
    const [selectedZoneId, setSelectedZoneId] = useState<string>('');
    const [soilTests, setSoilTests] = useState<SoilTest[]>([]);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState({farms: true, zones: false, soil: false, weather: true});
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    
    useEffect(() => {
        getFarms().then(data => {
            setFarms(data);
            if (data.length > 0) {
                setSelectedFarmId(data[0].id);
            }
            setLoading(prev => ({...prev, farms: false}));
        });
        getWeather().then(data => {
            setWeather(data);
            setLoading(prev => ({...prev, weather: false}));
        });
    }, []);

    useEffect(() => {
        if (selectedFarmId) {
            setLoading(prev => ({...prev, zones: true}));
            getZonesByFarmId(selectedFarmId).then(data => {
                setZones(data);
                if (data.length > 0) {
                    setSelectedZoneId(data[0].id);
                } else {
                    setSelectedZoneId('');
                    setSoilTests([]);
                }
                setLoading(prev => ({...prev, zones: false}));
            });
        }
    }, [selectedFarmId]);

    useEffect(() => {
        if (selectedZoneId) {
            setLoading(prev => ({...prev, soil: true}));
            getSoilTestByZoneId(selectedZoneId).then(data => {
                setSoilTests(data);
                setLoading(prev => ({...prev, soil: false}));
            });
        } else {
            setSoilTests([]);
        }
    }, [selectedZoneId]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFileName(file.name);
            setUploadStatus('uploading');
            // Simulate upload
            setTimeout(() => {
                setUploadStatus('success');
                // Reset after a few seconds
                setTimeout(() => {
                    setUploadStatus('idle');
                    setUploadedFileName(null);
                }, 3000);
            }, 1500);
        }
    };

    const latestTest = soilTests?.[0];

    const radarData = latestTest ? [
        { subject: 'pH', value: latestTest.ph, fullMark: 14 },
        { subject: 'Nitrogen', value: latestTest.nitrogen, fullMark: 50 },
        { subject: 'Phosphorus', value: latestTest.phosphorus, fullMark: 50 },
        { subject: 'Potassium', value: latestTest.potassium, fullMark: 200 },
        { subject: 'Org. Matter', value: latestTest.organicMatter, fullMark: 5 },
    ] : [];

    const historicalChartData = soilTests.length > 1 
        ? [...soilTests].reverse().map(test => ({
            date: test.sampleDate,
            pH: test.ph,
            Nitrogen: test.nitrogen,
            Phosphorus: test.phosphorus,
            Potassium: test.potassium,
          }))
        : [];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-on-surface">Soil & Weather Data</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="farm-select" className="block text-sm font-medium text-gray-700">Select Farm</label>
                    <select id="farm-select" value={selectedFarmId} onChange={e => setSelectedFarmId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                        {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="zone-select" className="block text-sm font-medium text-gray-700">Select Zone</label>
                    <select id="zone-select" value={selectedZoneId} onChange={e => setSelectedZoneId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md" disabled={loading.zones}>
                        {loading.zones ? <option>Loading zones...</option> : zones.map(zone => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Latest Soil Test Results</h2>
                    {loading.soil ? <Spinner /> : latestTest ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-3">
                                <p className="text-sm text-slate-500">Sample Date: {latestTest.sampleDate}</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    <InfoItem label="pH Level" value={latestTest.ph.toString()} />
                                    <InfoItem label="Organic Matter" value={`${latestTest.organicMatter} %`} />
                                    <InfoItem label="Nitrogen (N)" value={`${latestTest.nitrogen} ppm`} />
                                    <InfoItem label="Phosphorus (P)" value={`${latestTest.phosphorus} ppm`} />
                                    <InfoItem label="Potassium (K)" value={`${latestTest.potassium} ppm`} />
                                </div>
                            </div>
                            <div className="w-full h-64 md:h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#475569' }}/>
                                        <Radar name="Soil" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : <p>No soil test data available for this zone.</p>}
                     <div className="mt-6 border-t pt-4">
                        <h3 className="font-semibold text-md mb-2">Upload New Lab Report</h3>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                    {uploadStatus === 'idle' && (
                                        <>
                                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                            <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        </>
                                    )}
                                    {uploadStatus === 'uploading' && (
                                        <>
                                            <Spinner />
                                            <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                                        </>
                                    )}
                                    {uploadStatus === 'success' && (
                                        <>
                                            <CheckCircle className="w-8 h-8 mb-2 text-green-500" />
                                            <p className="text-sm text-green-600 font-semibold">{uploadedFileName}</p>
                                            <p className="text-xs text-slate-500">Upload successful!</p>
                                        </>
                                    )}
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} disabled={uploadStatus === 'uploading'} />
                            </label>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-semibold mb-4">Live Weather</h2>
                    {loading.weather ? <Spinner /> : weather ? (
                         <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-5xl font-bold">{weather.temperature}°C</p>
                                    <p className="text-slate-500">Clear skies</p>
                                </div>
                                <div className="text-5xl">☀️</div>
                            </div>
                             <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                                <InfoItem icon={<Droplets className="mx-auto text-blue-500"/>} label="Humidity" value={`${weather.humidity}%`} />
                                <InfoItem icon={<Wind className="mx-auto text-slate-500"/>} label="Wind" value={`${weather.windSpeed} km/h`} />
                                <InfoItem icon={<Thermometer className="mx-auto text-red-500"/>} label="Rain (24h)" value={`${weather.precipitation} mm`} />
                             </div>
                        </div>
                    ) : <p>Could not load weather data.</p>}
                </Card>
            </div>
            
            {historicalChartData.length > 0 && !loading.soil && (
                <Card>
                    <h2 className="text-xl font-semibold mb-4">Historical Soil Analysis</h2>
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicalChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}/>
                                <Legend />
                                <Line type="monotone" dataKey="pH" stroke="#8884d8" name="pH" />
                                <Line type="monotone" dataKey="Nitrogen" stroke="#82ca9d" name="Nitrogen (ppm)" />
                                <Line type="monotone" dataKey="Phosphorus" stroke="#ffc658" name="Phosphorus (ppm)" />
                                <Line type="monotone" dataKey="Potassium" stroke="#ff8042" name="Potassium (ppm)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}
        </div>
    );
};

const InfoItem: React.FC<{label: string, value: string, icon?: React.ReactNode}> = ({label, value, icon}) => (
    <div>
        {icon}
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
    </div>
);
