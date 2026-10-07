import { useState, useCallback } from 'react';

export type NotifType = 'match' | 'request' | 'message' | 'session' | 'badge' | 'system' | 'review';

export interface NotificationPrefs {
    match: boolean;       // New match suggestions
    request: boolean;     // Match requests (new + accepted)
    message: boolean;     // New messages
    session: boolean;     // Session reminders (1h before)
    badge: boolean;       // Badge unlocks
    review: boolean;      // New reviews received
    system: boolean;      // Admin & system alerts
}

const STORAGE_KEY = 'skillswap_notif_prefs';

const DEFAULT_PREFS: NotificationPrefs = {
    match: true,
    request: true,
    message: true,
    session: true,
    badge: true,
    review: true,
    system: true,
};

function loadPrefs(): NotificationPrefs {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_PREFS, ...parsed };
        }
    } catch {
        // ignore
    }
    return { ...DEFAULT_PREFS };
}

function savePrefs(prefs: NotificationPrefs) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
        // ignore
    }
}

export function useNotificationPrefs() {
    const [prefs, setPrefsState] = useState<NotificationPrefs>(loadPrefs);

    const setPrefs = useCallback((updates: Partial<NotificationPrefs>) => {
        setPrefsState(prev => {
            const next = { ...prev, ...updates };
            savePrefs(next);
            return next;
        });
    }, []);

    const toggle = useCallback((type: NotifType) => {
        setPrefsState(prev => {
            const next = { ...prev, [type]: !prev[type] };
            savePrefs(next);
            return next;
        });
    }, []);

    return { prefs, setPrefs, toggle };
}
