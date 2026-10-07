import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Sparkles,
    Target,
    Clock,
    PenLine,
    CheckCircle2,
    Save,
    Loader2,
    AlertCircle,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import { LearningSession, User } from '../../types';
import { storageService } from '../../services/storageService';
import { Modal } from '../ui/Modal';

// ── Types ────────────────────────────────────────────────────────────────────

interface LessonStep {
    timeRange: string;
    title: string;
    description: string;
}

interface LessonPlan {
    learningGoal: string;
    steps: LessonStep[];
    practiceTask: string;
}

type FetchState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; plan: LessonPlan; fromCache: boolean };

// Module-level browser cache so revisiting the modal is instant
const browserPlanCache = new Map<string, LessonPlan>();

// ── Component ─────────────────────────────────────────────────────────────────

interface LessonPlanModalProps {
    session: LearningSession | null;
    currentUser: User;
    isOpen: boolean;
    onClose: () => void;
}

export const LessonPlanModal: React.FC<LessonPlanModalProps> = ({
    session,
    currentUser,
    isOpen,
    onClose
}) => {
    const isTeacher = session?.teacherId === currentUser.id;

    const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' });

    // Editable draft — kept independently from fetchState so edits survive
    const [draft, setDraft] = useState<LessonPlan | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    // ── Fetch plan ─────────────────────────────────────────────────────────────

    const fetchPlan = useCallback(async (sess: LearningSession, force = false) => {
        if (!force) {
            const hit = browserPlanCache.get(sess.id);
            if (hit) {
                setDraft(hit);
                setFetchState({ status: 'success', plan: hit, fromCache: true });
                return;
            }
        }

        setFetchState({ status: 'loading' });

        try {
            const response = await fetch('/api/session-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: sess.id,
                    skillName: sess.skillName,
                    teacherName: sess.teacherName,
                    learnerName: sess.learnerName,
                    notes: sess.notes || '',
                }),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data: LessonPlan & { fromCache: boolean } = await response.json();

            browserPlanCache.set(sess.id, data);
            if (mountedRef.current) {
                setDraft({ learningGoal: data.learningGoal, steps: data.steps, practiceTask: data.practiceTask });
                setFetchState({ status: 'success', plan: data, fromCache: data.fromCache });
            }
        } catch (err) {
            if (mountedRef.current) {
                setFetchState({ status: 'error', message: String(err) });
            }
        }
    }, []);

    // Trigger fetch when modal opens
    useEffect(() => {
        if (isOpen && session) {
            setSavedSuccess(false);
            fetchPlan(session);
        }
        if (!isOpen) {
            setFetchState({ status: 'idle' });
            setDraft(null);
        }
    }, [isOpen, session, fetchPlan]);

    // ── Save handler ───────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!draft || !session) return;
        setIsSaving(true);

        // Serialise plan into the session notes field as structured text
        const notesText = [
            `📌 LESSON PLAN — ${session.skillName}`,
            ``,
            `🎯 Learning Goal`,
            draft.learningGoal,
            ``,
            ...draft.steps.flatMap((s, i) => [
                `Step ${i + 1}: ${s.title} [${s.timeRange}]`,
                s.description,
                ``,
            ]),
            `✏️ Practice Task`,
            draft.practiceTask,
        ].join('\n');

        storageService.updateSessionNotes(session.id, notesText);
        // Also update browser cache so re-opening is instant
        browserPlanCache.set(session.id, draft);

        setIsSaving(false);
        setSavedSuccess(true);
        setTimeout(() => { if (mountedRef.current) setSavedSuccess(false); }, 2500);
    };

    // ── Helpers ────────────────────────────────────────────────────────────────

    const updateStep = (index: number, field: keyof LessonStep, value: string) => {
        if (!draft) return;
        const newSteps = draft.steps.map((s, i) => i === index ? { ...s, [field]: value } : s);
        setDraft({ ...draft, steps: newSteps });
    };

    const inputStyle = {
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-soft)',
        color: 'var(--color-text)',
        borderRadius: '10px',
        width: '100%',
        padding: '8px 12px',
        fontSize: '12px',
        outline: 'none',
        resize: 'vertical' as const,
    };

    const readonlyStyle = {
        ...inputStyle,
        backgroundColor: 'transparent',
        border: 'none',
        padding: '0',
        resize: 'none' as const,
        cursor: 'default',
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    if (!session) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    <span>AI Lesson Plan — {session.skillName}</span>
                </div>
            }
            subtitle={
                isTeacher
                    ? 'AI-generated 60-minute plan. Edit any section and save.'
                    : `Plan prepared by ${session.teacherName} for your session.`
            }
        >
            <div className="space-y-5 text-xs">

                {/* Loading */}
                {fetchState.status === 'loading' && (
                    <div
                        className="flex flex-col items-center justify-center gap-3 py-12"
                        style={{ color: 'var(--color-muted)' }}
                    >
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} />
                        <span className="text-sm">Generating lesson plan with Gemini…</span>
                        <span className="text-[11px] opacity-70">Usually takes 3–6 seconds</span>
                    </div>
                )}

                {/* Error */}
                {fetchState.status === 'error' && (
                    <div
                        className="flex flex-col items-center gap-3 py-10"
                        style={{ color: 'var(--color-muted)' }}
                    >
                        <AlertCircle className="w-6 h-6" />
                        <p className="text-sm text-center">Could not generate plan right now. Make sure <code>npm run dev:server</code> is running.</p>
                        <button
                            onClick={() => fetchPlan(session, true)}
                            className="px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer flex items-center gap-1.5"
                            style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                        >
                            <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                    </div>
                )}

                {/* Plan */}
                {(fetchState.status === 'success' || fetchState.status === 'loading') && draft && (
                    <>
                        {/* Cache badge */}
                        {fetchState.status === 'success' && fetchState.fromCache && (
                            <div
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
                                style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                            >
                                <CheckCircle2 className="w-3 h-3" /> Loaded from cache
                            </div>
                        )}

                        {/* Session meta pill row */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'Skill', value: session.skillName },
                                { label: 'Duration', value: '60 min' },
                                { label: 'Role', value: isTeacher ? 'Teaching' : 'Learning' },
                            ].map(({ label, value }) => (
                                <span
                                    key={label}
                                    className="px-2.5 py-1 rounded-full text-[10px] font-medium"
                                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)', color: 'var(--color-muted)' }}
                                >
                                    <span style={{ color: 'var(--color-primary)' }}>{label}:</span> {value}
                                </span>
                            ))}
                        </div>

                        {/* Learning Goal */}
                        <div
                            className="p-4 rounded-xl space-y-2"
                            style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)' }}
                        >
                            <div className="flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                                    Learning Goal
                                </span>
                            </div>
                            {isTeacher ? (
                                <textarea
                                    rows={2}
                                    value={draft.learningGoal}
                                    onChange={e => setDraft({ ...draft, learningGoal: e.target.value })}
                                    style={inputStyle}
                                />
                            ) : (
                                <p style={{ color: 'var(--color-text)', lineHeight: '1.6' }}>{draft.learningGoal}</p>
                            )}
                        </div>

                        {/* 3 Steps */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                                    Session Timeline
                                </span>
                            </div>

                            {draft.steps.map((step, i) => (
                                <div
                                    key={i}
                                    className="p-4 rounded-xl space-y-2"
                                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)' }}
                                >
                                    {/* Time + Title row */}
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                                            style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                                        >
                                            {step.timeRange}
                                        </span>
                                        {isTeacher ? (
                                            <input
                                                type="text"
                                                value={step.title}
                                                onChange={e => updateStep(i, 'title', e.target.value)}
                                                style={{ ...inputStyle, padding: '4px 10px', borderRadius: '8px', flex: 1 }}
                                            />
                                        ) : (
                                            <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{step.title}</span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {isTeacher ? (
                                        <textarea
                                            rows={2}
                                            value={step.description}
                                            onChange={e => updateStep(i, 'description', e.target.value)}
                                            style={inputStyle}
                                        />
                                    ) : (
                                        <p style={{ color: 'var(--color-muted)', lineHeight: '1.6' }}>{step.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Practice Task */}
                        <div
                            className="p-4 rounded-xl space-y-2"
                            style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)' }}
                        >
                            <div className="flex items-center gap-1.5">
                                <PenLine className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                                    Practice Task
                                </span>
                            </div>
                            {isTeacher ? (
                                <textarea
                                    rows={2}
                                    value={draft.practiceTask}
                                    onChange={e => setDraft({ ...draft, practiceTask: e.target.value })}
                                    style={inputStyle}
                                />
                            ) : (
                                <p style={{ color: 'var(--color-text)', lineHeight: '1.6' }}>{draft.practiceTask}</p>
                            )}
                        </div>

                        {/* Footer actions */}
                        <div
                            className="flex items-center justify-between pt-2 gap-3"
                            style={{ borderTop: '1px solid var(--color-soft)' }}
                        >
                            {isTeacher ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => { browserPlanCache.delete(session.id); fetchPlan(session, true); }}
                                        className="text-[11px] cursor-pointer flex items-center gap-1 hover:underline"
                                        style={{ color: 'var(--color-muted)' }}
                                    >
                                        <RefreshCw className="w-3 h-3" /> Regenerate
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isSaving || savedSuccess}
                                        className="px-5 py-2 rounded-full text-xs font-medium flex items-center gap-2 cursor-pointer transition-all hover:opacity-85 disabled:opacity-60"
                                        style={{ backgroundColor: savedSuccess ? 'var(--color-primary)' : 'var(--color-soft)', color: savedSuccess ? '#fff' : 'var(--color-primary)' }}
                                     aria-label="Loader2">
                                        {isSaving ? (
                                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                                        ) : savedSuccess ? (
                                            <><CheckCircle2 className="w-3.5 h-3.5" /> Saved!</>
                                        ) : (
                                            <><Save className="w-3.5 h-3.5" /> Save Plan</>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                    This plan is set by your teacher. Join on time and come prepared!
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};
