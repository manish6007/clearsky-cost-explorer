import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';

interface CurrencyConfig {
    code: Currency;
    symbol: string;
    locale: string;
    rate: number; // Exchange rate relative to USD
}

export const CURRENCY_CONFIG: Record<Currency, CurrencyConfig> = {
    USD: { code: 'USD', symbol: '$', locale: 'en-US', rate: 1 },
    EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', rate: 0.92 },
    GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', rate: 0.79 },
    INR: { code: 'INR', symbol: '₹', locale: 'en-IN', rate: 83.5 },
};

interface SettingsContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    emailAlerts: boolean;
    setEmailAlerts: (enabled: boolean) => void;
    formatCurrency: (amount: number) => string;
    formatCurrencyCompact: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

interface SettingsProviderProps {
    children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    const [currency, setCurrencyState] = useState<Currency>(() => {
        const stored = localStorage.getItem('currency') as Currency;
        return stored && CURRENCY_CONFIG[stored] ? stored : 'USD';
    });

    const [emailAlerts, setEmailAlertsState] = useState<boolean>(() => {
        const stored = localStorage.getItem('emailAlerts');
        return stored === null ? true : stored === 'true';
    });

    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    useEffect(() => {
        localStorage.setItem('emailAlerts', String(emailAlerts));
    }, [emailAlerts]);

    const setCurrency = (newCurrency: Currency) => {
        setCurrencyState(newCurrency);
    };

    const setEmailAlerts = (enabled: boolean) => {
        setEmailAlertsState(enabled);
    };

    const formatCurrency = (amount: number): string => {
        const config = CURRENCY_CONFIG[currency];
        const convertedAmount = amount * config.rate;
        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(convertedAmount);
    };

    const formatCurrencyCompact = (amount: number): string => {
        const config = CURRENCY_CONFIG[currency];
        const convertedAmount = amount * config.rate;

        if (convertedAmount >= 1000000) {
            return `${config.symbol}${(convertedAmount / 1000000).toFixed(1)}M`;
        }
        if (convertedAmount >= 1000) {
            return `${config.symbol}${(convertedAmount / 1000).toFixed(1)}K`;
        }
        return `${config.symbol}${convertedAmount.toFixed(0)}`;
    };

    return (
        <SettingsContext.Provider value={{
            currency,
            setCurrency,
            emailAlerts,
            setEmailAlerts,
            formatCurrency,
            formatCurrencyCompact,
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
