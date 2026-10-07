import React, { useState } from 'react';
import { Flag, CheckCircle2, X } from 'lucide-react';
import { User, SafetyReport } from '../../types';
import { storageService } from '../../services/storageService';
import { Modal } from './Modal';

const REPORT_REASONS: SafetyReport['category'][] = [
    'Harassment',
    'Spam',
    'Inappropriate content',
    'No-show',
    'Other'
];

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reporter: User;
    reported: User;
}

export const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    reporter,
    reported
}) => {
    const [selectedCategory, setSelectedCategory] = useState<SafetyReport['category'] | ''>('');
    const [details, setDetails] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;

        storageService.createReport({
            reporterId: reporter.id,
            reporterName: reporter.name,
            reportedUserId: reported.id,
            reportedUserName: reported.name,
            category: selectedCategory as SafetyReport['category'],
            details: details.trim() || 'No additional details provided.'
        });

        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setSelectedCategory('');
            setDetails('');
            onClose();
        }, 1800);
    };

    const handleClose = () => {
        if (!submitted) {
            setSelectedCategory('');
            setDetails('');
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Report User"
            subtitle={`Submit a safety report about ${reported.name}`}
        >
            {submitted ? (
                <div className="p-6 text-center space-y-3">
                    <CheckCircle2
                        className="w-12 h-12 mx-auto animate-bounce"
                        style={{ color: 'var(--color-primary)' }}
                    />
                    <h3
                        className="font-medium text-base"
                        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                    >
                        Report Submitted
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        Thank you. Campus administrators will review and take action within 24 hours.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* Reporter info */}
                    <div
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{
                            backgroundColor: 'var(--color-bg)',
                            border: '1px solid var(--color-soft)'
                        }}
                    >
                        <img
                            src={reported.photoURL}
                            alt={reported.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                                {reported.name}
                            </p>
                            <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                {reported.collegeName} • {reported.course}
                            </p>
                        </div>
                    </div>

                    {/* Reason selection */}
                    <div>
                        <label className="block font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                            Reason for report <span style={{ color: 'var(--color-primary)' }}>*</span>
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {REPORT_REASONS.map(reason => (
                                <button
                                    key={reason}
                                    type="button"
                                    onClick={() => setSelectedCategory(reason)}
                                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer"
                                    style={{
                                        backgroundColor:
                                            selectedCategory === reason
                                                ? 'var(--color-soft)'
                                                : 'var(--color-bg)',
                                        border: `1px solid ${selectedCategory === reason ? 'var(--color-primary)' : 'var(--color-soft)'}`,
                                        color:
                                            selectedCategory === reason
                                                ? 'var(--color-primary)'
                                                : 'var(--color-text)'
                                    }}
                                >
                                    <span
                                        className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                                        style={{
                                            borderColor:
                                                selectedCategory === reason
                                                    ? 'var(--color-primary)'
                                                    : 'var(--color-muted)'
                                        }}
                                    >
                                        {selectedCategory === reason && (
                                            <span
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: 'var(--color-primary)' }}
                                            />
                                        )}
                                    </span>
                                    <span className="font-medium">{reason}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Additional details */}
                    <div>
                        <label className="block font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                            Additional details (optional)
                        </label>
                        <textarea
                            rows={3}
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            placeholder="Describe what happened to help our team investigate..."
                            className="w-full px-3 py-2 rounded-xl outline-none resize-none"
                            style={{
                                backgroundColor: 'var(--color-bg)',
                                border: '1px solid var(--color-soft)',
                                color: 'var(--color-text)'
                            }}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-1 gap-2">
                        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                            Reports are confidential and reviewed by campus staff.
                        </p>
                        <div className="flex gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--color-soft)] transition-colors"
                                style={{ color: 'var(--color-muted)' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedCategory}
                                className="px-5 py-2 font-medium rounded-full cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-40 flex items-center gap-1.5"
                                style={{
                                    backgroundColor: '#ef4444',
                                    color: '#FFFFFF'
                                }}
                            >
                                <Flag className="w-3.5 h-3.5" />
                                Submit Report
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </Modal>
    );
};
