import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, Sun, Moon, X, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useSettings, Currency, CURRENCY_CONFIG } from '../../hooks/useSettings';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

const notifications = [
    {
        id: 1,
        title: 'Cost Alert',
        message: 'ClearSky exceeded budget threshold by 15%',
        time: '2 hours ago',
        unread: true,
    },
    {
        id: 2,
        title: 'Budget Update',
        message: 'Q4 cloud budget has been approved',
        time: '1 day ago',
        unread: true,
    },
    {
        id: 3,
        title: 'Report Ready',
        message: 'Monthly cost report is ready for download',
        time: '2 days ago',
        unread: false,
    },
];

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
    const { theme, toggleTheme, setTheme } = useTheme();
    const { currency, setCurrency, emailAlerts, setEmailAlerts } = useSettings();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => n.unread).length;

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrency(e.target.value as Currency);
    };

    const handleEmailAlertsToggle = () => {
        setEmailAlerts(!emailAlerts);
    };

    return (
        <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-8 py-4 transition-colors duration-200">
            <div className="flex items-center justify-between">
                {/* Title section */}
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{title}</h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Currency Badge */}
                    <div className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium rounded-md">
                        {CURRENCY_CONFIG[currency].symbol} {currency}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 w-64 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500 transition-colors"
                        />
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowSettings(false);
                            }}
                            className="relative p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-elevated animate-fade-in z-50">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                                    <h3 className="font-semibold text-neutral-900 dark:text-white">Notifications</h3>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`px-4 py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors ${notif.unread ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {notif.unread && (
                                                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                                                )}
                                                <div className={notif.unread ? '' : 'ml-5'}>
                                                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{notif.title}</p>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{notif.message}</p>
                                                    <p className="text-xs text-neutral-400 mt-1">{notif.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700">
                                    <button className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline w-full text-center">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <div className="relative" ref={settingsRef}>
                        <button
                            onClick={() => {
                                setShowSettings(!showSettings);
                                setShowNotifications(false);
                            }}
                            className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        {/* Settings Dropdown */}
                        {showSettings && (
                            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-elevated animate-fade-in z-50">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                                    <h3 className="font-semibold text-neutral-900 dark:text-white">Settings</h3>
                                    <button
                                        onClick={() => setShowSettings(false)}
                                        className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-4 space-y-4">
                                    {/* Theme Selection */}
                                    <div>
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                                            Appearance
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setTheme('light')}
                                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${theme === 'light'
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                                    : 'border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                                                    }`}
                                            >
                                                <Sun className="w-4 h-4" />
                                                <span className="text-sm">Light</span>
                                                {theme === 'light' && <Check className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => setTheme('dark')}
                                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${theme === 'dark'
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                                    : 'border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                                                    }`}
                                            >
                                                <Moon className="w-4 h-4" />
                                                <span className="text-sm">Dark</span>
                                                {theme === 'dark' && <Check className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Currency */}
                                    <div>
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                                            Currency
                                        </label>
                                        <select
                                            value={currency}
                                            onChange={handleCurrencyChange}
                                            className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 cursor-pointer"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="INR">INR (₹)</option>
                                        </select>
                                    </div>

                                    {/* Email Alerts Toggle */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block">
                                                Email Alerts
                                            </label>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {emailAlerts ? 'Enabled' : 'Disabled'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleEmailAlertsToggle}
                                            className={`w-11 h-6 rounded-full p-0.5 transition-colors ${emailAlerts ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'
                                                }`}
                                        >
                                            <div
                                                className={`w-5 h-5 bg-white rounded-full transition-transform ${emailAlerts ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
