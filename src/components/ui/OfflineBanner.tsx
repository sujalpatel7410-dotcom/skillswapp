import React, { useState, useEffect, useRef } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

type BannerState = 'hidden' | 'offline' | 'back-online';

export const OfflineBanner: React.FC = () => {
    const [state, setState] = useState<BannerState>(
        () => (typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'hidden')
    );
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const goOffline = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setState('offline');
        };

        const goOnline = () => {
            setState('back-online');
            timerRef.current = setTimeout(() => setState('hidden'), 4000);
        };

        window.addEventListener('offline', goOffline);
        window.addEventListener('online', goOnline);
        return () => {
            window.removeEventListener('offline', goOffline);
            window.removeEventListener('online', goOnline);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    if (state === 'hidden') return null;

    const isOffline = state === 'offline';

    return (
        <div
            role="alert"
            aria-live="assertive"
            className="fixed top-16 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
            style={{ animation: 'offline-slide-down 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
        >
            <style>{`
        @keyframes offline-slide-down {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes offline-slide-up {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-16px); }
        }
      `}</style>
            <div
                className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-full shadow-lg text-sm font-medium"
                style={{
                    backgroundColor: isOffline ? '#1a1a1a' : '#166534',
                    color: '#fff',
                    boxShadow: isOffline
                        ? '0 4px 24px rgba(0,0,0,0.3)'
                        : '0 4px 24px rgba(22,101,52,0.35)',
                }}
            >
                {isOffline ? (
                    <>
                        <WifiOff className="w-4 h-4 shrink-0" style={{ color: '#f97316' }} />
                        <span>You're offline — some features may be unavailable.</span>
                    </>
                ) : (
                    <>
                        <Wifi className="w-4 h-4 shrink-0" style={{ color: '#4ade80' }} />
                        <span>Back online!</span>
                    </>
                )}
            </div>
        </div>
    );
};
