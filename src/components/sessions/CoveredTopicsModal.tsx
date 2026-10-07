import React, { useState } from 'react';
import { CheckSquare, Square, BookOpen, Sparkles } from 'lucide-react';
import { LearningSession, User } from '../../types';
import { storageService } from '../../services/storageService';
import { Modal } from '../ui/Modal';

interface CoveredTopicsModalProps {
    session: LearningSession | null;
    currentUser: User;
    isOpen: boolean;
    onClose: () => void;
}

/** Pre-defined topic banks per skill keyword for smart suggestions */
const TOPIC_SUGGESTIONS: Record<string, string[]> = {
    default: [
        'Introduction & concepts overview',
        'Core theory / fundamentals',
        'Hands-on practice / exercises',
        'Q&A and doubt resolution',
        'Project walkthrough',
        'Debugging & troubleshooting',
        'Best practices & tips',
        'Assessment / mini quiz',
    ],
    python: [
        'Variables, data types, operators',
        'Control flow (if/else, loops)',
        'Functions & lambda expressions',
        'Lists, tuples, sets, dicts',
        'File I/O & exception handling',
        'OOP: classes & inheritance',
        'Modules & pip packages',
        'Web scraping / automation demo',
    ],
    javascript: [
        'Variables (var/let/const) & scope',
        'DOM manipulation',
        'Functions & arrow functions',
        'Promises & async/await',
        'ES6+ features',
        'Event handling',
        'Fetch API & REST calls',
        'Debugging in DevTools',
    ],
    react: [
        'Component architecture',
        'JSX syntax & rendering',
        'Props & state management',
        'useEffect & lifecycle hooks',
        'Context API',
        'React Router navigation',
        'Forms & event handling',
        'Performance optimisation',
    ],
    design: [
        'Design principles (CRAP)',
        'Color theory & palettes',
        'Typography & font pairing',
        'Layout & grid systems',
        'UX research methods',
        'Wireframing & prototyping',
        'Figma / tools usage',
        'Design handoff to developers',
    ],
    machine: [
        'ML pipeline overview',
        'Data preprocessing & cleaning',
        'Feature engineering',
        'Supervised vs unsupervised learning',
        'Model training & evaluation',
        'Cross-validation techniques',
        'Hyperparameter tuning',
        'Model deployment basics',
    ],
    sql: [
        'SELECT, WHERE, ORDER BY',
        'JOINs (INNER, LEFT, RIGHT)',
        'GROUP BY & aggregations',
        'Subqueries & CTEs',
        'Indexing for performance',
        'Transactions & ACID',
        'Stored procedures',
        'Query optimisation',
    ],
};

function getTopicsForSkill(skillName: string): string[] {
    const lower = skillName.toLowerCase();
    for (const key of Object.keys(TOPIC_SUGGESTIONS)) {
        if (key !== 'default' && lower.includes(key)) {
            return TOPIC_SUGGESTIONS[key];
        }
    }
    return TOPIC_SUGGESTIONS.default;
}

export const CoveredTopicsModal: React.FC<CoveredTopicsModalProps> = ({
    session,
    currentUser,
    isOpen,
    onClose,
}) => {
    const isTeacher = session?.teacherId === currentUser.id;

    const suggestions = session ? getTopicsForSkill(session.skillName) : [];
    const [checked, setChecked] = useState<Set<string>>(() => new Set(session?.coveredTopics || []));
    const [customTopic, setCustomTopic] = useState('');
    const [extraTopics, setExtraTopics] = useState<string[]>([]);
    const [saved, setSaved] = useState(false);

    // Reset when session changes
    React.useEffect(() => {
        setChecked(new Set(session?.coveredTopics || []));
        setExtraTopics([]);
        setCustomTopic('');
        setSaved(false);
    }, [session?.id]);

    const allTopics = [...suggestions, ...extraTopics];

    const toggle = (topic: string) => {
        if (!isTeacher) return;
        setChecked(prev => {
            const next = new Set(prev);
            if (next.has(topic)) next.delete(topic);
            else next.add(topic);
            return next;
        });
        setSaved(false);
    };

    const addCustom = () => {
        const trimmed = customTopic.trim();
        if (trimmed && !allTopics.includes(trimmed)) {
            setExtraTopics(prev => [...prev, trimmed]);
            setChecked(prev => new Set([...prev, trimmed]));
        }
        setCustomTopic('');
        setSaved(false);
    };

    const handleSave = () => {
        if (!session) return;
        const topics = Array.from(checked);
        storageService.updateSessionCoverage(session.id, topics);
        setSaved(true);
        setTimeout(() => {
            onClose();
        }, 700);
    };

    if (!session) return null;

    const pct = allTopics.length > 0 ? Math.round((checked.size / allTopics.length) * 100) : 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isTeacher ? 'Verify Topics Covered' : 'Topics Covered This Session'}
            subtitle={
                isTeacher
                    ? `Tick everything you covered with ${session.learnerName} in "${session.skillName}"`
                    : `Topics ${session.teacherName} verified from your "${session.skillName}" session`
            }
        >
            <div className="space-y-5 text-sm">
                {/* Progress summary */}
                <div
                    className="p-3 rounded-xl flex items-center gap-3"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)' }}
                >
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                    >
                        {pct}%
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                            {checked.size} of {allTopics.length} topics ticked
                        </p>
                        <div className="w-full h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ backgroundColor: 'var(--color-soft)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: 'var(--color-primary)' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Topic checklist */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {allTopics.map(topic => {
                        const isChecked = checked.has(topic);
                        return (
                            <button
                                key={topic}
                                type="button"
                                onClick={() => toggle(topic)}
                                disabled={!isTeacher}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                                style={{
                                    backgroundColor: isChecked ? 'var(--color-soft)' : 'transparent',
                                    border: `1px solid ${isChecked ? 'var(--color-primary)20' : 'var(--color-soft)'}`,
                                    cursor: isTeacher ? 'pointer' : 'default',
                                    opacity: !isTeacher && !isChecked ? 0.5 : 1,
                                }}
                            >
                                {isChecked
                                    ? <CheckSquare className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
                                    : <Square className="w-4 h-4 shrink-0" style={{ color: 'var(--color-muted)' }} />
                                }
                                <span
                                    className="text-xs font-medium"
                                    style={{ color: isChecked ? 'var(--color-primary)' : 'var(--color-text)' }}
                                >
                                    {topic}
                                </span>
                            </button>
                        );
                    })}

                    {allTopics.length === 0 && (
                        <div className="text-center py-6" style={{ color: 'var(--color-muted)' }}>
                            <BookOpen className="w-7 h-7 mx-auto mb-2 opacity-40" />
                            <p className="text-xs">No topic suggestions yet. Add your own below.</p>
                        </div>
                    )}
                </div>

                {/* Add custom topic (teacher only) */}
                {isTeacher && (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={customTopic}
                            onChange={e => setCustomTopic(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addCustom()}
                            placeholder="Add a custom topic…"
                            className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                            style={{
                                backgroundColor: 'var(--color-bg)',
                                border: '1px solid var(--color-soft)',
                                color: 'var(--color-text)',
                            }}
                        />
                        <button
                            type="button"
                            onClick={addCustom}
                            disabled={!customTopic.trim()}
                            className="px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-40"
                            style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                        >
                            Add
                        </button>
                    </div>
                )}

                {/* Footer actions */}
                <div className="flex justify-end gap-2 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-full text-xs cursor-pointer hover:opacity-75 transition-opacity"
                        style={{ border: '1px solid var(--color-soft)', color: 'var(--color-muted)' }}
                     aria-label="Action">
                        {isTeacher ? 'Cancel' : 'Close'}
                    </button>
                    {isTeacher && (
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-5 py-2 rounded-full text-xs font-medium cursor-pointer hover:opacity-85 transition-all flex items-center gap-1.5"
                            style={{
                                backgroundColor: saved ? '#22c55e' : 'var(--color-primary)',
                                color: '#ffffff',
                            }}
                         aria-label="Enhance">
                            <Sparkles className="w-3.5 h-3.5" />
                            {saved ? 'Saved!' : 'Save & Update Progress'}
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};
