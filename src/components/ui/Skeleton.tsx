import React from 'react';

// ─────────────────────────────────────────────
// Core shimmer style injected once
// ─────────────────────────────────────────────
const SHIMMER_STYLE: React.CSSProperties = {
    background: 'linear-gradient(90deg, var(--color-soft) 25%, color-mix(in srgb, var(--color-soft) 50%, var(--color-surface)) 50%, var(--color-soft) 75%)',
    backgroundSize: '200% 100%',
    animation: 'sk-shimmer 1.6s ease-in-out infinite',
    borderRadius: '6px',
};

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('sk-shimmer-style')) {
    const s = document.createElement('style');
    s.id = 'sk-shimmer-style';
    s.textContent = `
    @keyframes sk-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
    document.head.appendChild(s);
}

// ─────────────────────────────────────────────
// Primitive atoms
// ─────────────────────────────────────────────

interface BoxProps {
    w?: string;
    h?: string;
    rounded?: string;
    className?: string;
}

export const SkeletonBox: React.FC<BoxProps> = ({
    w = '100%', h = '1rem', rounded = '6px', className = ''
}) => (
    <div
        className={className}
        style={{ ...SHIMMER_STYLE, width: w, height: h, borderRadius: rounded, flexShrink: 0 }}
    />
);

export const SkeletonCircle: React.FC<{ size?: string }> = ({ size = '2.5rem' }) => (
    <div style={{ ...SHIMMER_STYLE, width: size, height: size, borderRadius: '50%', flexShrink: 0 }} />
);

export const SkeletonText: React.FC<{ lines?: number; lastWidth?: string }> = ({
    lines = 2, lastWidth = '60%'
}) => (
    <div className="space-y-2" style={{ width: '100%' }}>
        {Array.from({ length: lines }).map((_, i) => (
            <SkeletonBox
                key={i}
                h="0.75rem"
                w={i === lines - 1 ? lastWidth : '100%'}
            />
        ))}
    </div>
);

// Generic card shell
export const SkeletonCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children, className = ''
}) => (
    <div
        className={`p-5 ${className}`}
        style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-soft)',
            borderRadius: 'var(--radius-card)',
        }}
    >
        {children}
    </div>
);

// ─────────────────────────────────────────────
// Per-page skeleton screens
// ─────────────────────────────────────────────

/** Used on Dashboard */
export const DashboardSkeleton: React.FC = () => (
    <div className="space-y-6 pb-12">
        {/* greeting */}
        <div className="space-y-2">
            <SkeletonBox h="2rem" w="55%" />
            <SkeletonBox h="0.85rem" w="35%" />
        </div>

        {/* stat cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i}>
                    <SkeletonBox h="1.5rem" w="40%" />
                    <SkeletonBox h="0.7rem" w="65%" className="mt-2" />
                </SkeletonCard>
            ))}
        </div>

        {/* two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* main panel */}
            <div className="lg:col-span-2 space-y-4">
                <SkeletonBox h="1.1rem" w="30%" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i}>
                        <div className="flex items-center gap-3">
                            <SkeletonCircle size="3rem" />
                            <div className="flex-1 space-y-2">
                                <SkeletonBox h="0.85rem" w="45%" />
                                <SkeletonBox h="0.7rem" w="70%" />
                                <SkeletonBox h="0.7rem" w="50%" />
                            </div>
                        </div>
                    </SkeletonCard>
                ))}
            </div>
            {/* side panel */}
            <div className="space-y-4">
                <SkeletonBox h="1.1rem" w="50%" />
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i}>
                        <div className="flex items-center gap-3">
                            <SkeletonCircle size="2rem" />
                            <SkeletonBox h="0.75rem" w="60%" />
                        </div>
                    </SkeletonCard>
                ))}
            </div>
        </div>
    </div>
);

/** Used on Discover / Matches */
export const DiscoverSkeleton: React.FC = () => (
    <div className="space-y-6 pb-12">
        <div className="space-y-2">
            <SkeletonBox h="2rem" w="50%" />
            <SkeletonBox h="0.85rem" w="40%" />
        </div>

        {/* search bar */}
        <SkeletonCard>
            <SkeletonBox h="2.5rem" rounded="999px" />
            <div className="flex gap-3 mt-3 flex-wrap">
                {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonBox key={i} h="1.75rem" w="6rem" rounded="999px" />
                ))}
            </div>
        </SkeletonCard>

        {/* student cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i}>
                    <div className="flex items-start gap-3 mb-4">
                        <SkeletonCircle size="3rem" />
                        <div className="flex-1 space-y-2">
                            <SkeletonBox h="0.9rem" w="50%" />
                            <SkeletonBox h="0.7rem" w="70%" />
                            <SkeletonBox h="0.7rem" w="40%" />
                        </div>
                    </div>
                    <SkeletonBox h="0.65rem" w="80%" className="mb-3" />
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {[60, 80, 50].map((w, j) => (
                            <SkeletonBox key={j} h="1.4rem" w={`${w}px`} rounded="999px" />
                        ))}
                    </div>
                    <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-soft)' }}>
                        <SkeletonBox h="2rem" rounded="999px" w="45%" />
                        <SkeletonBox h="2rem" rounded="999px" w="50%" />
                    </div>
                </SkeletonCard>
            ))}
        </div>
    </div>
);

/** Used on Sessions */
export const SessionsSkeleton: React.FC = () => (
    <div className="space-y-6 pb-12">
        <div className="space-y-2">
            <SkeletonBox h="2rem" w="45%" />
            <SkeletonBox h="0.85rem" w="55%" />
        </div>
        {/* tab row */}
        <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBox key={i} h="2.25rem" w="5.5rem" rounded="999px" />
            ))}
        </div>
        {/* session cards */}
        {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <SkeletonCircle size="3rem" />
                        <div className="space-y-2 flex-1">
                            <SkeletonBox h="0.9rem" w="40%" />
                            <SkeletonBox h="0.75rem" w="60%" />
                            <SkeletonBox h="0.7rem" w="35%" />
                        </div>
                    </div>
                    <SkeletonBox h="2rem" w="7rem" rounded="999px" />
                </div>
            </SkeletonCard>
        ))}
    </div>
);

/** Used on Progress */
export const ProgressSkeleton: React.FC = () => (
    <div className="space-y-6 pb-12">
        <SkeletonBox h="2rem" w="40%" />
        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i}>
                    <SkeletonBox h="1.8rem" w="50%" />
                    <SkeletonBox h="0.7rem" w="80%" className="mt-2" />
                </SkeletonCard>
            ))}
        </div>
        {/* Chart placeholder */}
        <SkeletonCard>
            <SkeletonBox h="1rem" w="30%" className="mb-4" />
            <SkeletonBox h="10rem" />
        </SkeletonCard>
        {/* Skill progress bars */}
        <SkeletonCard>
            <SkeletonBox h="1rem" w="35%" className="mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="mb-4 space-y-2">
                    <div className="flex justify-between">
                        <SkeletonBox h="0.85rem" w="40%" />
                        <SkeletonBox h="0.85rem" w="15%" />
                    </div>
                    <SkeletonBox h="0.5rem" rounded="999px" />
                </div>
            ))}
        </SkeletonCard>
    </div>
);

/** Used on Chat / Messages */
export const ChatSkeleton: React.FC = () => (
    <div className="flex gap-0 h-[calc(100vh-8rem)]">
        {/* Conversation list */}
        <div
            className="w-72 shrink-0 border-r space-y-1 p-3 overflow-hidden"
            style={{ borderColor: 'var(--color-soft)', backgroundColor: 'var(--color-surface)' }}
        >
            <SkeletonBox h="2.25rem" rounded="999px" className="mb-3" />
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                    <SkeletonCircle size="2.5rem" />
                    <div className="flex-1 space-y-1.5">
                        <SkeletonBox h="0.75rem" w="55%" />
                        <SkeletonBox h="0.65rem" w="80%" />
                    </div>
                </div>
            ))}
        </div>
        {/* Chat panel */}
        <div className="flex-1 flex flex-col p-4 gap-3">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--color-soft)' }}>
                <SkeletonCircle size="2.5rem" />
                <div className="space-y-1.5">
                    <SkeletonBox h="0.85rem" w="8rem" />
                    <SkeletonBox h="0.65rem" w="5rem" />
                </div>
            </div>
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-hidden">
                {[['30%', false], ['45%', true], ['25%', false], ['55%', true], ['35%', false]].map(([w, right], i) => (
                    <div key={i} className={`flex ${right ? 'justify-end' : 'justify-start'}`}>
                        <SkeletonBox h="2.5rem" w={w as string} rounded="1rem" />
                    </div>
                ))}
            </div>
            {/* Input */}
            <SkeletonBox h="3rem" rounded="999px" />
        </div>
    </div>
);

/** Used on Profile */
export const ProfileSkeleton: React.FC = () => (
    <div className="space-y-6 pb-12">
        {/* Hero banner */}
        <SkeletonCard>
            <div className="flex items-start gap-5">
                <SkeletonCircle size="5rem" />
                <div className="flex-1 space-y-2">
                    <SkeletonBox h="1.5rem" w="40%" />
                    <SkeletonBox h="0.85rem" w="60%" />
                    <SkeletonBox h="0.75rem" w="50%" />
                    <div className="flex gap-2 mt-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonBox key={i} h="1.75rem" w="5rem" rounded="999px" />
                        ))}
                    </div>
                </div>
            </div>
        </SkeletonCard>
        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <SkeletonCard>
                    <SkeletonBox h="1rem" w="30%" className="mb-4" />
                    <SkeletonText lines={3} lastWidth="75%" />
                </SkeletonCard>
                <SkeletonCard>
                    <SkeletonBox h="1rem" w="35%" className="mb-4" />
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 mb-3">
                            <SkeletonCircle size="2rem" />
                            <div className="flex-1 space-y-1.5">
                                <SkeletonBox h="0.8rem" w="50%" />
                                <SkeletonBox h="0.65rem" w="70%" />
                            </div>
                        </div>
                    ))}
                </SkeletonCard>
            </div>
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i}>
                        <SkeletonBox h="0.9rem" w="50%" className="mb-3" />
                        <div className="flex flex-wrap gap-2">
                            {[50, 65, 45].map((w, j) => (
                                <SkeletonBox key={j} h="1.5rem" w={`${w}px`} rounded="999px" />
                            ))}
                        </div>
                    </SkeletonCard>
                ))}
            </div>
        </div>
    </div>
);

/** Used on Skills */
export const SkillsSkeleton: React.FC = () => (
    <div className="space-y-6 pb-12">
        <SkeletonBox h="2rem" w="40%" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i}>
                    <div className="flex items-center gap-3 mb-4">
                        <SkeletonCircle size="2.5rem" />
                        <div className="flex-1 space-y-2">
                            <SkeletonBox h="0.9rem" w="45%" />
                            <SkeletonBox h="0.7rem" w="65%" />
                        </div>
                    </div>
                    <SkeletonBox h="0.5rem" rounded="999px" className="mb-3" />
                    <div className="flex gap-2">
                        {[40, 55, 40].map((w, j) => (
                            <SkeletonBox key={j} h="1.5rem" w={`${w}%`} rounded="999px" />
                        ))}
                    </div>
                </SkeletonCard>
            ))}
        </div>
    </div>
);

/** Used on Badges / Leaderboard */
export const BadgesSkeleton: React.FC = () => (
    <div className="space-y-6 pb-12">
        <SkeletonBox h="2rem" w="35%" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} className="text-center">
                    <SkeletonCircle size="3rem" />
                    <SkeletonBox h="0.8rem" w="70%" className="mt-3 mx-auto" />
                    <SkeletonBox h="0.65rem" w="90%" className="mt-2 mx-auto" />
                </SkeletonCard>
            ))}
        </div>
    </div>
);

/** Admin skeleton */
export const AdminSkeleton: React.FC = () => (
    <div className="space-y-6 pb-12">
        <SkeletonBox h="2rem" w="45%" />
        {/* tabs */}
        <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBox key={i} h="2.25rem" w="6rem" rounded="999px" />
            ))}
        </div>
        {/* table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <SkeletonCircle size="2.5rem" />
                        <div className="space-y-1.5 flex-1">
                            <SkeletonBox h="0.85rem" w="35%" />
                            <SkeletonBox h="0.7rem" w="55%" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {Array.from({ length: 3 }).map((_, j) => (
                            <SkeletonBox key={j} h="2rem" w="4.5rem" rounded="999px" />
                        ))}
                    </div>
                </div>
            </SkeletonCard>
        ))}
    </div>
);
