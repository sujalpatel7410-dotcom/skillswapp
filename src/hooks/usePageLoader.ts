import { useState, useEffect } from 'react';

/**
 * Simulates a short async "page load" phase on first mount of a view.
 * Because storageService is in-memory, data is instantly available —
 * but we still want to flash the skeleton for a frame or two so 
 * the UI doesn't feel jarring. Waits `delayMs` (default 500ms).
 *
 * Usage:
 *   const isLoading = usePageLoader();
 *   if (isLoading) return <DashboardSkeleton />;
 */
export function usePageLoader(delayMs = 500): boolean {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = setTimeout(() => setLoading(false), delayMs);
        return () => clearTimeout(id);
    }, []); // empty: fires once on mount

    return loading;
}
