import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingContextType {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    startLoading: () => void;
    stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const startLoading = useCallback(() => setIsLoading(true), []);
    const stopLoading = useCallback(() => setIsLoading(false), []);
    const setLoading = useCallback((loading: boolean) => setIsLoading(loading), []);

    return (
        <LoadingContext.Provider value={{ isLoading, setLoading, startLoading, stopLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}; 