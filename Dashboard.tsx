
import React, { useEffect, useState, useRef } from 'react';
import { Card } from './common/Card';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, AreaChart, Area,
} from 'recharts';
import { getDashboardSummary, getWeather } from '../services/mockApiService';
import type { DashboardSummary, ProactiveAlert, WeatherData } from '../types';
import { AlertTriangle, Sun, Wind, Droplets, TrendingUp, BarChart2, Lightbulb, Package, RefreshCw, Hexagon, Fish, Factory, Zap } from 'lucide-react';
import { Spinner } from './common/Spinner';
import { useCurrency } from './CurrencyContext';
import { formatCurrency } from './common/formatters';

const KPICard = ({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description: string }) => (
    <Card className="flex flex-col justify-between p-6">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-slate-100">{icon}</div>
            <div className="ml-4">
                <p className="text-sm text-slate-500">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">{description}</p>
    </Card>
);

const alertIconMap: Record<ProactiveAlert['type'], React.ReactNode> = {
    'Disease Risk': <Lightbulb className="text-yellow-500" size={20} />,
    'Weather Warning': <AlertTriangle className="text-red-500" size={20} />,
    'Low Stock': <Package className="text-orange-500" size={20} />,
    'Nutrient Deficiency': <Lightbulb className="text-purple-500" size={20} />,
    'System Anomaly': <Zap className="text-blue-500" size={20} />,
};

const alertColorMap: Record<ProactiveAlert['severity'], string> = {
    'High': 'border-l-4 border-red-500',
    'Medium': 'border-l-4 border-yellow-500',
    'Low': 'border-l-4 border-blue-500',
};

export const Dashboard: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const initialLoad = useRef(true);
    const { currency } = useCurrency();

    const fetchDashboardData = async () => {
        if (initialLoad.current) {
            setLoading(true);
        }

        const [summaryData, weatherData] = await Promise.all([
            getDashboardSummary(),
            getWeather(),
        ]);
        
        setSummary(summaryData);
        setWeather(weatherData);
        setLastUpdated(new Date());

        if (initialLoad.current) {
            setLoading(false);
            initialLoad.current = false;
        }
    };

    useEffect(() => {
      fetchDashboardData();
      const intervalId = setInterval(fetchDashboardData, 30000); // Auto-refresh every 30 seconds
      return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    const kpiItems = summary ? [
      { title: 'AI Proactive Alerts', value: summary.alerts.length, icon: <AlertTriangle className="text-red-500" />, description: 'Requiring immediate attention' },
      { title: 'Avg. Yield Forecast', value: `${(summary.yieldForecasts.reduce((a,b) => a + b.forecastedYield, 0) / (summary.yieldForecasts.length || 1)).toFixed(1)} Tons`, icon: <TrendingUp className="text-green-500" />, description: 'Across all major crops' },
      { title: 'Next Month Net Forecast', value: formatCurrency(summary.financialForecasts[0]?.projectedNet || 0, currency.symbol), icon: <BarChart2 className="text-blue-500" />, description: `For ${summary.financialForecasts[0]?.month}`},
      { title: 'Total Hives', value: summary.beekeeping.totalHives, icon: <Hexagon className="text-yellow-600" />, description: `${summary.beekeeping.hivesHealthy} healthy hives`},
      { title: 'Fish Biomass', value: `${(summary.aquaculture.totalFishBiomass).toFixed(2)} kg`, icon: <Fish className="text-cyan-500" />, description: `${summary.aquaculture.pondsWithAlerts} ponds with alerts`},
      { title: 'CEA Systems', value: summary.cea.activeSystems, icon: <Factory className="text-indigo-500" />, description: `${summary.cea.systemsWithAlerts} with alerts`},
    ] : [];
    
    if (loading || !summary) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold text-on-surface">Predictive Dashboard</h1>
                 {lastUpdated && (
                    <div className="flex items-center text-xs text-slate-500 mt-1 sm:mt-0">
                        <RefreshCw size={12} className="mr-1.5" />
                        Live Data as of: {lastUpdated.toLocaleTimeString()}
                    </div>
                )}
            </div>
            
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {kpiItems.map(item => <KPICard key={item.title} {...item} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Proactive Alerts */}
                <Card className="lg:col-span-1">
                    <h2 className="text-lg font-semibold mb-4">Proactive AI Alerts</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {summary.alerts.map((alert) => (
                             <div key={alert.id} className={`p-3 rounded-lg bg-slate-50 ${alertColorMap[alert.severity]}`}>
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        {alertIconMap[alert.type]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{alert.title}</p>
                                        <p className="text-xs text-gray-500">{alert.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Forecasts */}
                <Card className="lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-4">Yield &amp; Financial Forecasts</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-96">
                        {/* Yield Forecast */}
                         <div>
                            <h3 className="text-md font-semibold text-center mb-2">Yield Forecast (Tons)</h3>
                             <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={summary.yieldForecasts} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#64748b' }} fontSize={12} />
                                    <YAxis type="category" dataKey="cropName" tick={{ fill: '#64748b' }} fontSize={12} width={80} />
                                    <Tooltip cursor={{fill: 'rgba(241, 245, 249, 0.5)'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                                    <Bar dataKey="forecastedYield" fill="#22c55e" radius={[0, 4, 4, 0]} name="Forecasted Yield" />
                                </BarChart>
                            </ResponsiveContainer>
                         </div>
                         {/* Financial Forecast */}
                          <div>
                            <h3 className="text-md font-semibold text-center mb-2">Financial Forecast (Next 3 Months)</h3>
                            <ResponsiveContainer width="100%" height="90%">
                                <AreaChart data={summary.financialForecasts} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b' }} fontSize={12}/>
                                    <YAxis tick={{ fill: '#64748b' }} fontSize={12} tickFormatter={(value) => `${currency.symbol}${(value as number / 1000)}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} formatter={(value: number) => formatCurrency(value, currency.symbol)} />
                                    <Legend wrapperStyle={{fontSize: "14px"}}/>
                                    <Area type="monotone" dataKey="projectedIncome" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Income" />
                                    <Area type="monotone" dataKey="projectedExpenses" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expenses" />
                                </AreaChart>
                            </ResponsiveContainer>
                         </div>
                    </div>
                </Card>
            </div>
            
            {weather && <Card>
                <h2 className="text-lg font-semibold mb-4">Current Weather</h2>
                <div className="flex flex-col sm:flex-row justify-around items-center text-center">
                    <div className="mb-4 sm:mb-0">
                        <p className="text-6xl font-bold">{weather.temperature}°</p>
                        <p className="text-slate-500">Sunny, Central Valley</p>
                    </div>
                    <div className="flex justify-around text-center text-sm w-full max-w-xs">
                        <div className="flex flex-col items-center space-y-1">
                            <Droplets className="text-blue-400" />
                            <p className="font-semibold">{weather.humidity}%</p>
                            <p className="text-slate-500 text-xs">Humidity</p>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                            <Wind className="text-slate-400" />
                            <p className="font-semibold">{weather.windSpeed} km/h</p>
                                <p className="text-slate-500 text-xs">Wind</p>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                            <Sun className="text-yellow-400" />
                            <p className="font-semibold">{weather.precipitation} mm</p>
                                <p className="text-slate-500 text-xs">Rain (24h)</p>
                        </div>
                    </div>
                    <div className="space-y-2 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-8 mt-4 sm:mt-0 w-full sm:w-auto max-w-xs">
                        {weather.forecast.map(f => (
                            <div key={f.day} className="flex justify-between items-center text-sm w-full">
                                <span className="font-medium text-slate-600">{f.day}</span>
                                <span className="text-xl">{f.icon}</span>
                                <span className="font-semibold">{f.temp}°</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>}
        </div>
    );
};
