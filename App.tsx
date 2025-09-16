
import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { OperationsManagement } from './components/OperationsManagement';
import { AiAdvisor } from './components/AiAdvisor';
import { InventoryFinance } from './components/InventoryFinance';
import { SoilAndWeather } from './components/SoilAndWeather';
import { TaskManagement } from './components/TaskManagement';
import { LaborManagement } from './components/LaborManagement';
import { AutomationControl } from './components/AutomationControl';
import { FileManager } from './components/FileManager';
import { UserProfile } from './components/UserProfile';
import { StockManagement } from './components/LivestockManagement';
import { WaterManagement } from './components/WaterManagement';
import { BeekeepingManagement } from './components/BeekeepingManagement';
import { AquacultureManagement } from './components/AquacultureManagement';
import { CEAManagement } from './components/CEAManagement';
import { PrecisionAgriculture } from './components/PrecisionAgriculture';
import { DataManagement } from './components/DataManagement';
import { Leaf, Tractor, Bot, Banknote, Map, TestTube, CloudSun, ClipboardList, Users, Zap, FileImage, Beef, Droplets, Hexagon, Fish, Factory, Wind, Trees, ShieldCheck, Sun, Recycle, Crosshair } from 'lucide-react';
import { CurrencyProvider } from './components/CurrencyContext';

const App: React.FC = () => {
  return (
    <CurrencyProvider>
      <HashRouter>
        <div className="flex h-screen bg-background text-on-surface">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/operations" element={<OperationsManagement />} />
              <Route path="/cea-management" element={<CEAManagement />} />
              <Route path="/soil-weather" element={<SoilAndWeather />} />
              <Route path="/water-management" element={<WaterManagement />} />
              <Route path="/task-management" element={<TaskManagement />} />
              <Route path="/labor-management" element={<LaborManagement />} />
              <Route path="/stock-management" element={<StockManagement />} />
              <Route path="/beekeeping" element={<BeekeepingManagement />} />
              <Route path="/aquaculture" element={<AquacultureManagement />} />
              <Route path="/automation" element={<AutomationControl />} />
              <Route path="/ai-advisor" element={<AiAdvisor />} />
              <Route path="/inventory-finance" element={<InventoryFinance />} />
              <Route path="/precision-agriculture" element={<PrecisionAgriculture />} />
              <Route path="/files-gallery" element={<FileManager />} />
              <Route path="/data-management" element={<DataManagement />} />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </CurrencyProvider>
  );
};

const Sidebar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navGroups = [
      { 
        title: 'Core',
        items: [
          { to: '/', icon: <Tractor size={20} />, text: 'Dashboard' },
          { to: '/ai-advisor', icon: <Bot size={20} />, text: 'AI Advisor' },
          { to: '/task-management', icon: <ClipboardList size={20} />, text: 'Task Management' },
        ]
      },
      {
        title: 'Operations',
        items: [
          { to: '/operations', icon: <Map size={20} />, text: 'Zones & Fields' },
          { to: '/cea-management', icon: <Factory size={20} />, text: 'Controlled Env.' },
          { to: '/stock-management', icon: <Beef size={20} />, text: 'Livestock' },
          { to: '/aquaculture', icon: <Fish size={20} />, text: 'Aquaculture' },
          { to: '/beekeeping', icon: <Hexagon size={20} />, text: 'Beekeeping' },
        ]
      },
      {
        title: 'Management',
        items: [
          { to: '/labor-management', icon: <Users size={20} />, text: 'Labor' },
          { to: '/inventory-finance', icon: <Banknote size={20} />, text: 'Inventory & Finance' },
          { to: '/automation', icon: <Zap size={20} />, text: 'Automation' },
        ]
      },
      {
        title: 'Resources',
        items: [
          { to: '/soil-weather', icon: <div className="flex items-center"><TestTube size={18} /><CloudSun size={18} className="-ml-1"/></div>, text: 'Soil & Weather' },
          { to: '/water-management', icon: <Droplets size={20} />, text: 'Water' },
          { to: '/precision-agriculture', icon: <Crosshair size={20} />, text: 'Precision Ag Tools' },
          { to: '/files-gallery', icon: <FileImage size={20} />, text: 'Files & Gallery' },
        ]
      },
      {
        title: 'Administration',
        items: [
          { to: '/data-management', icon: <ShieldCheck size={20} />, text: 'Data Management' },
        ]
      }
    ];
    
    const navLinkClasses = "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200";
    const activeLinkClasses = "bg-primary text-white shadow-md";
    const inactiveLinkClasses = "text-slate-600 hover:bg-green-100";

    const sidebarContent = (
      <div className="flex flex-col h-full bg-surface shadow-lg">
        <div className="flex items-center justify-center p-4 border-b border-slate-200">
          <Leaf className="text-primary" size={28} />
          <h1 className="ml-2 text-xl font-bold text-primary-dark">Agri-Tech AI</h1>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {navGroups.map(group => (
            <div key={group.title} className="py-2">
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`${navLinkClasses} ${location.pathname === item.to ? activeLinkClasses : inactiveLinkClasses}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="font-medium text-sm">{item.text}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <NavLink
          to="/profile"
          className={({ isActive }) => `block border-t border-slate-200 transition-colors duration-200 ${isActive ? 'bg-green-50' : 'hover:bg-slate-50'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex items-center p-4">
            <img src="https://picsum.photos/40/40" alt="User" className="rounded-full" />
            <div className="ml-3">
              <p className="font-semibold text-sm">John Farmer</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
        </NavLink>
      </div>
    );

    return (
      <>
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-20 flex items-center justify-between p-4 bg-surface shadow-md w-full">
            <div className="flex items-center">
                <Leaf className="text-primary" size={24} />
                <h1 className="ml-2 text-lg font-bold text-primary-dark">Agri-Tech AI</h1>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
        </div>

        {/* Mobile Sidebar (Drawer) */}
        <div className={`fixed inset-0 z-30 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
            <div className="w-64 h-full bg-surface shadow-2xl">
                {sidebarContent}
            </div>
            <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 h-full flex-shrink-0">
          {sidebarContent}
        </aside>
      </>
    );
};

export default App;
