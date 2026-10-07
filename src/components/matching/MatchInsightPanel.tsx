import React from 'react';
import { Sparkles, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { User, UserSkill } from '../../types';
import { useMatchInsight } from '../../hooks/useMatchInsight';

interface MatchInsightPanelProps {
    currentUser: User;
    partner: User;
    allUserSkills: UserSkill[];
}

export const MatchInsightPanel: React.FC<MatchInsightPanelProps> = ({
    currentUser,
    partner,
    allUserSkills,
}) => {
    const insight = useMatchInsight(currentUser, partner, allUserSkills);

    if (insight.status === 'idle' || insight.status === 'loading') {
        return (
            <div
                className="p-3.5 rounded-xl flex items-center gap-2.5"
                style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-soft)',
                }}
            >
                <Loader2
                    className="w-3.5 h-3.5 shrink-0 animate-spin"
                    style={{ color: 'var(--color-primary)' }}
                />
                <span className="text-xs italic" style={{ color: 'var(--color-muted)' }}>
                    Generating AI insight…
                </span>
            </div>
        );
    }

    if (insight.status === 'error') {
        return (
            <div
                className="p-3.5 rounded-xl flex items-center gap-2.5"
                style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-soft)',
                }}
            >
                <AlertCircle
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: 'var(--color-muted)' }}
                />
                <span className="text-xs italic" style={{ color: 'var(--color-muted)' }}>
                    AI insight unavailable right now.
                </span>
            </div>
        );
    }

    const { explanation, sessionTopic } = insight.data;

    return (
        <div
            className="p-3.5 rounded-xl space-y-2.5"
            style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)',
            }}
        >
            {/* Section label */}
            <div className="flex items-center gap-1.5">
                <Sparkles
                    className="w-3 h-3 shrink-0"
                    style={{ color: 'var(--color-primary)' }}
                />
                <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-primary)' }}
                >
                    Why you match
                </span>
            </div>

            {/* 2-sentence AI explanation */}
            <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--color-text)' }}
            >
                {explanation}
            </p>

            {/* Suggested first session topic */}
            <div
                className="pt-2.5 flex items-center gap-2"
                style={{ borderTop: '1px solid var(--color-soft)' }}
            >
                <BookOpen
                    className="w-3 h-3 shrink-0"
                    style={{ color: 'var(--color-primary)' }}
                />
                <span
                    className="text-[10px] font-medium uppercase tracking-wider mr-1"
                    style={{ color: 'var(--color-muted)' }}
                >
                    Suggested first session:
                </span>
                <span
                    className="text-xs font-semibold"
                    style={{ color: 'var(--color-text)' }}
                >
                    {sessionTopic}
                </span>
            </div>
        </div>
    );
};
