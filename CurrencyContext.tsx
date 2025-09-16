
import React, { createContext, useState, useContext, useEffect } from 'react';

export interface Currency {
    code: string;
    symbol: string;
    name: string;
}

export const currencies: Currency[] = [
    { code: 'USD', symbol: '$', name: 'United States Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'GBP', symbol: '£', name: 'British Pound Sterling' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

const defaultCurrency = currencies[0]; // USD

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: defaultCurrency,
    setCurrency: () => {},
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState<Currency>(() => {
        try {
            const savedCurrency = localStorage.getItem('app-currency');
            if (savedCurrency) {
                const parsed = JSON.parse(savedCurrency) as Currency;
                // Ensure the saved currency is in our list
                return currencies.find(c => c.code === parsed.code) || defaultCurrency;
            }
        } catch (error) {
            console.error("Failed to parse currency from localStorage", error);
        }
        return defaultCurrency;
    });

    useEffect(() => {
        try {
            localStorage.setItem('app-currency', JSON.stringify(currency));
        } catch (error) {
            console.error("Failed to save currency to localStorage", error);
        }
    }, [currency]);

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
