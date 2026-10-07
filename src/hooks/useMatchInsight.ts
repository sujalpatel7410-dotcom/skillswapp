import { useState, useEffect, useRef } from 'react';
import { User, UserSkill } from '../types';

export interface MatchInsight {
    explanation: string;
    sessionTopic: string;
    fromCache: boolean;
}

type InsightState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: MatchInsight }
    | { status: 'error'; message: string };

// Module-level browser cache so insights survive re-mounts without re-fetching.
// Key: "userIdA::userIdB" (sorted, same as server normalisation)
const browserCache = new Map<string, MatchInsight>();

function makeCacheKey(a: string, b: string) {
    return [a, b].sort().join('::');
}

function buildPayload(
    user: User,
    userSkills: UserSkill[],
    partner: User,
    partnerSkills: UserSkill[]
) {
    const myTeach = userSkills.filter(s => s.userId === user.id && s.type === 'teach').map(s => s.skillName);
    const myLearn = userSkills.filter(s => s.userId === user.id && s.type === 'learn').map(s => s.skillName);
    const theirTeach = partnerSkills.filter(s => s.userId === partner.id && s.type === 'teach').map(s => s.skillName);
    const theirLearn = partnerSkills.filter(s => s.userId === partner.id && s.type === 'learn').map(s => s.skillName);

    return {
        currentUser: {
            id: user.id,
            name: user.name,
            teachSkills: myTeach,
            learnSkills: myLearn,
            interests: user.interests ?? [],
            availability: user.availability ?? [],
        },
        partner: {
            id: partner.id,
            name: partner.name,
            teachSkills: theirTeach,
            learnSkills: theirLearn,
            interests: partner.interests ?? [],
            availability: partner.availability ?? [],
        },
    };
}

/**
 * Fetches a Gemini-generated "Why you match" insight for a current user + partner pair.
 * Results are cached in the browser for the lifetime of the page session so they
 * are never re-fetched on re-mounts or tab switches.
 */
export function useMatchInsight(
    currentUser: User,
    partner: User,
    allUserSkills: UserSkill[]
): InsightState {
    const cacheKey = makeCacheKey(currentUser.id, partner.id);
    const [state, setState] = useState<InsightState>(() => {
        const hit = browserCache.get(cacheKey);
        return hit ? { status: 'success', data: hit } : { status: 'idle' };
    });

    // Track whether we are still mounted to avoid setState after unmount
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        const hit = browserCache.get(cacheKey);
        if (hit) {
            setState({ status: 'success', data: hit });
            return;
        }

        setState({ status: 'loading' });

        const mySkills = allUserSkills.filter(s => s.userId === currentUser.id);
        const partnerSkills = allUserSkills.filter(s => s.userId === partner.id);
        const payload = buildPayload(currentUser, mySkills, partner, partnerSkills);

        fetch('/api/match-insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json() as Promise<MatchInsight>;
            })
            .then(data => {
                browserCache.set(cacheKey, data);
                if (mountedRef.current) setState({ status: 'success', data });
            })
            .catch(err => {
                console.error('[useMatchInsight] fetch error:', err);
                if (mountedRef.current) setState({ status: 'error', message: String(err) });
            });
        // Only re-run if the pair changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cacheKey]);

    return state;
}
