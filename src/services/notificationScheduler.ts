/**
 * notificationScheduler.ts
 * Polls every minute and fires a 1-hour-before session reminder notification.
 * Call `startScheduler(userId)` once when the user logs in.
 * Call `stopScheduler()` on logout.
 */

import { storageService } from './storageService';

const ONE_HOUR_MS = 60 * 60 * 1000;
const REMINDER_WINDOW_MS = 2 * 60 * 1000; // fire if within 2 min of the 1h mark
const FIRED_KEY = 'skillswap_reminded_sessions';

function getFiredSet(): Set<string> {
    try {
        const raw = localStorage.getItem(FIRED_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

function markFired(sessionId: string) {
    const set = getFiredSet();
    set.add(sessionId);
    try {
        localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(set)));
    } catch {
        // ignore
    }
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startScheduler(userId: string, sessionEnabled: () => boolean) {
    stopScheduler();

    const tick = () => {
        if (!sessionEnabled()) return;

        const now = Date.now();
        const sessions = storageService.getSessions(userId);
        const fired = getFiredSet();

        for (const session of sessions) {
            if (session.status !== 'scheduled') continue;
            if (fired.has(session.id)) continue;

            const sessionTime = new Date(session.scheduledAt).getTime();
            const timeUntil = sessionTime - now;

            // Fire if we're within [1h - 2min, 1h + 2min] window
            if (timeUntil > ONE_HOUR_MS - REMINDER_WINDOW_MS && timeUntil <= ONE_HOUR_MS + REMINDER_WINDOW_MS) {
                const isTeacher = session.teacherId === userId;
                const partnerName = isTeacher ? session.learnerName : session.teacherName;

                storageService.createNotification({
                    userId,
                    title: `⏰ Session in 1 hour`,
                    description: `Your "${session.skillName}" session with ${partnerName} starts at ${session.timeSlot}. Get ready!`,
                    type: 'session',
                    link: '/sessions',
                });

                markFired(session.id);
            }
        }
    };

    // Run immediately, then every 60s
    tick();
    intervalId = setInterval(tick, 60_000);
}

export function stopScheduler() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
}
