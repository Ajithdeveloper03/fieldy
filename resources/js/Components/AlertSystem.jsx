import React, { createContext, useContext, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { AlertCircle, CheckCircle, Info, TriangleAlert, X } from 'lucide-react';
import i18n from '../i18n';

const AlertContext = createContext(null);

export const useAlert = () => useContext(AlertContext);

export default function AlertSystem({ children }) {
   
    const playSiren = () => {
        console.log('Playing Critical Siren Audio...');
        
    };

    const playPing = () => {
        console.log('Playing High Alert Ping Audio...');
        
    };

    const triggerCritical = (message) => {
        playSiren();
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-alert-critical text-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <AlertCircle className="h-10 w-10 text-white animate-pulse" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-bold uppercase tracking-wider">{i18n.t('Critical Emergency')}</p>
                            <p className="mt-1 text-sm">{i18n.t(message)}</p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-white/20">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-white/10 focus:outline-none transition-colors"
                        title={i18n.t('Dismiss Alert')}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        ), { duration: Infinity });
    };
    const triggerHigh = (message) => {
        playPing();
        toast.error(message, {
            icon: <TriangleAlert className="text-alert-warning h-6 w-6 animate-pulse" />,
            style: { border: '2px solid var(--color-alert-warning)', padding: '16px', color: '#1E293B' },
            duration: 8000,
        });
    };
    const triggerMedium = (message) => {
        toast(message, {
            icon: <Info className="text-alert-warning h-5 w-5" />,
            style: { background: '#F8FAFC', color: '#334155' },
        });
    };
    const triggerInfo = (message) => {
        toast.success(message, {
            icon: <CheckCircle className="text-brand-primary h-5 w-5" />,
            style: { background: '#F8FAFC', color: '#334155' },
            duration: 3000,
        });
    };
    return (
        <AlertContext.Provider value={{ triggerCritical, triggerHigh, triggerMedium, triggerInfo }}>
            <Toaster position="top-right" reverseOrder={false} />
            {children}
        </AlertContext.Provider>
    );
}