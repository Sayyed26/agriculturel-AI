
import React, { useState, useEffect, useRef } from 'react';
import { getUserProfile, updateUserProfile, getFarms } from '../services/mockApiService';
// FIX: Renamed UserProfile type import to avoid conflict with component name.
import type { UserProfile as UserProfileType, Farm } from '../types';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { ToggleSwitch } from './common/ToggleSwitch';
import { User, Mail, Key, Bell, Building, CheckCircle, Upload, Globe } from 'lucide-react';
import { useCurrency, currencies, Currency } from './CurrencyContext';

// FIX: Renamed UserProfile type import to avoid conflict with component name.
export const UserProfile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfileType | null>(null);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { currency, setCurrency } = useCurrency();
    // FIX: Added state for controlled password input fields.
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        Promise.all([getUserProfile(), getFarms()]).then(([profileData, farmsData]) => {
            setProfile(profileData);
            setFarms(farmsData);
            setLoading(false);
        });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!profile) return;
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handleNotificationChange = (key: keyof UserProfileType['notificationPreferences'], value: boolean) => {
        if (!profile) return;
        setProfile({
            ...profile,
            notificationPreferences: {
                ...profile.notificationPreferences,
                [key]: value,
            },
        });
    };
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                if (profile) {
                    setProfile({ ...profile, avatarUrl: reader.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSaveProfile = async () => {
        if (!profile) return;
        setIsSaving(true);
        setSaveSuccess(false);
        await updateUserProfile(profile);
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    // FIX: Added handler for controlled password input fields.
    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({...prev, [name]: value}));
    };
    
    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCurrency = currencies.find(c => c.code === e.target.value);
        if (selectedCurrency) {
            setCurrency(selectedCurrency);
        }
    };

    const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("New passwords do not match.");
            return;
        }
        alert("Password change functionality is not implemented in this demo.");
        // FIX: Reset controlled password fields' state instead of using form.reset().
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    if (!profile) {
        return <p>Could not load user profile.</p>;
    }

    const associatedFarms = farms.filter(farm => profile.farmIds.includes(farm.id));

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-on-surface">My Profile</h1>
            
            <Card>
                <h2 className="text-xl font-semibold mb-4 flex items-center"><User className="mr-2 text-primary" /> Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center space-y-2 md:col-span-1">
                        <img src={avatarPreview || profile.avatarUrl} alt={profile.name} className="w-32 h-32 rounded-full object-cover shadow-md" />
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="text-sm text-primary hover:underline flex items-center"><Upload size={14} className="mr-1"/> Change Photo</button>
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <Input label="Full Name" name="name" value={profile.name} onChange={handleInputChange} />
                        {/* FIX: Added empty onChange handler for readOnly input to satisfy prop requirements. */}
                        <Input label="Email Address" name="email" value={profile.email} onChange={() => {}} readOnly />
                        <Input label="Phone Number" name="phone" value={profile.phone} onChange={handleInputChange} />
                        <Input label="Location" name="location" value={profile.location} onChange={handleInputChange} />
                        <Input label="Address" name="address" value={profile.address} onChange={handleInputChange} isTextArea />
                        {/* FIX: Added empty onChange handler for readOnly input to satisfy prop requirements. */}
                        <Input label="Role" name="role" value={profile.role} onChange={() => {}} readOnly />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                     <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center justify-center px-4 py-2 w-32 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition disabled:bg-slate-400">
                        {isSaving ? <Spinner /> : saveSuccess ? <CheckCircle size={20} /> : 'Save Profile'}
                    </button>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><Key className="mr-2 text-primary" /> Change Password</h2>
                    <form className="space-y-4" onSubmit={handleChangePassword}>
                        {/* FIX: Added value and onChange props to make password fields controlled components. */}
                        <Input label="Current Password" name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordInputChange} />
                        <Input label="New Password" name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordInputChange} />
                        <Input label="Confirm New Password" name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={handlePasswordInputChange} />
                        <div className="flex justify-end">
                            <button type="submit" className="px-4 py-2 bg-slate-600 text-white font-bold rounded-md hover:bg-slate-700 transition">Update Password</button>
                        </div>
                    </form>
                </Card>

                 <Card>
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><Bell className="mr-2 text-primary" /> Notification Settings</h2>
                    <div className="space-y-4">
                        <ToggleSwitch label="Task Alerts via Email" checked={profile.notificationPreferences.taskAlerts} onChange={(val) => handleNotificationChange('taskAlerts', val)} />
                        <ToggleSwitch label="AI Recommendations" checked={profile.notificationPreferences.aiRecommendations} onChange={(val) => handleNotificationChange('aiRecommendations', val)} />
                        <ToggleSwitch label="System Updates" checked={profile.notificationPreferences.systemUpdates} onChange={(val) => handleNotificationChange('systemUpdates', val)} />
                    </div>
                    <p className="text-xs text-slate-500 mt-4">Changes to notification settings are saved automatically.</p>
                </Card>
            </div>
             <Card>
                <h2 className="text-xl font-semibold mb-4 flex items-center"><Globe className="mr-2 text-primary" /> Regional Settings</h2>
                <div>
                    <label htmlFor="currency-select" className="block text-sm font-medium text-gray-700">Currency</label>
                    <select
                        id="currency-select"
                        value={currency.code}
                        onChange={handleCurrencyChange}
                        className="mt-1 block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    >
                        {currencies.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.name} ({c.symbol})
                            </option>
                        ))}
                    </select>
                </div>
            </Card>
            
             <Card>
                <h2 className="text-xl font-semibold mb-4 flex items-center"><Building className="mr-2 text-primary" /> Associated Farms</h2>
                <ul className="list-disc list-inside">
                    {associatedFarms.map(farm => (
                        <li key={farm.id} className="text-slate-700">{farm.name} <span className="text-xs text-slate-500">({farm.location})</span></li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

// Reusable Input component for the form
const Input = ({ label, name, value, onChange, type = 'text', readOnly = false, isTextArea = false }: { label: any; name: any; value: any; onChange: any; type?: string; readOnly?: boolean; isTextArea?: boolean; }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-500">{label}</label>
        {isTextArea ? (
             <textarea 
                id={name} 
                name={name} 
                value={value} 
                onChange={onChange}
                readOnly={readOnly}
                rows={3}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-slate-100 disabled:text-slate-500"
                disabled={readOnly}
            />
        ) : (
            <input 
                type={type} 
                id={name} 
                name={name} 
                value={value} 
                onChange={onChange}
                readOnly={readOnly}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-slate-100 disabled:text-slate-500"
                disabled={readOnly}
            />
        )}
    </div>
);
