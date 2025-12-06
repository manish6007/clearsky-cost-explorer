import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    LogOut,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
import { fetchDomains } from '../../services/api';
import { Domain, DOMAIN_COLORS } from '../../types';

interface NavItem {
    path: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    subItems?: { path: string; label: string; color?: string }[];
}

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [domainsExpanded, setDomainsExpanded] = useState(false);

    useEffect(() => {
        const loadDomains = async () => {
            try {
                const data = await fetchDomains();
                setDomains(data);
            } catch (error) {
                console.error('Failed to load domains:', error);
            }
        };
        loadDomains();
    }, []);

    // Auto-expand if on a domain page
    useEffect(() => {
        if (location.pathname.startsWith('/domains')) {
            setDomainsExpanded(true);
        }
    }, [location.pathname]);

    const navItems: NavItem[] = [
        { path: '/dashboard', label: 'Cost Overview', icon: LayoutDashboard },
    ];

    const isDomainActive = location.pathname.startsWith('/domains');

    return (
        <aside className="w-64 bg-neutral-900 text-white flex flex-col min-h-screen">
            {/* Logo */}
            <div className="p-6 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold">C</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold leading-tight">ClearSky</h1>
                        <p className="text-xs text-neutral-400">Cost Explorer</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin">
                <div className="space-y-1">
                    {/* Standard nav items */}
                    {navItems.map(({ path, label, icon: Icon }) => {
                        const isActive = location.pathname === path;
                        return (
                            <NavLink
                                key={path}
                                to={path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-primary-600 text-white'
                                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{label}</span>
                                {isActive && (
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                )}
                            </NavLink>
                        );
                    })}

                    {/* Domains section with expandable submenu */}
                    <div>
                        <button
                            onClick={() => setDomainsExpanded(!domainsExpanded)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isDomainActive
                                ? 'bg-primary-600 text-white'
                                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                }`}
                        >
                            <Building2 className="w-5 h-5" />
                            <span className="font-medium">Domains</span>
                            <ChevronDown
                                className={`w-4 h-4 ml-auto transition-transform duration-200 ${domainsExpanded ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {/* Domain submenu */}
                        {domainsExpanded && (
                            <div className="mt-1 ml-4 pl-4 border-l border-neutral-700 space-y-1">
                                {/* All Domains link */}
                                <NavLink
                                    to="/domains"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${location.pathname === '/domains'
                                        ? 'bg-neutral-800 text-white'
                                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                        }`}
                                >
                                    <span>All Domains</span>
                                </NavLink>

                                {/* Individual domain links */}
                                {domains.map((domain) => {
                                    const isActive = location.pathname === `/domains/${domain.id}`;
                                    return (
                                        <NavLink
                                            key={domain.id}
                                            to={`/domains/${domain.id}`}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActive
                                                ? 'bg-neutral-800 text-white'
                                                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                                }`}
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: DOMAIN_COLORS[domain.id] }}
                                            />
                                            <span className="truncate">{domain.name.replace('ClearSky ', '')}</span>
                                        </NavLink>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-neutral-800">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">JD</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">John Doe</p>
                        <p className="text-xs text-neutral-400 truncate">MD – Technology</p>
                    </div>
                    <button
                        className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        onClick={() => window.location.href = '/'}
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
