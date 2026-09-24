import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { User } from '../../types';
import { storageService } from '../../services/storageService';
import { matchingService } from '../../services/matchingService';
import { Repeat, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MatchScoreBadge } from './MatchScoreBadge';

interface ExchangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: User | null;
  defaultOfferedSkill?: string;
  defaultRequestedSkill?: string;
  onSuccess?: () => void;
}

export const ExchangeRequestModal: React.FC<ExchangeRequestModalProps> = ({
  isOpen,
  onClose,
  partner,
  defaultOfferedSkill = '',
  defaultRequestedSkill = '',
  onSuccess
}) => {
  const currentUser = storageService.getCurrentUser();
  if (!partner || !currentUser) return null;

  const mySkills = storageService.getUserSkills(currentUser.id).filter(s => s.type === 'teach');
  const partnerSkills = storageService.getUserSkills(partner.id).filter(s => s.type === 'teach');

  const [offeredSkill, setOfferedSkill] = useState(defaultOfferedSkill || mySkills[0]?.skillName || 'Python');
  const [requestedSkill, setRequestedSkill] = useState(defaultRequestedSkill || partnerSkills[0]?.skillName || 'Photoshop');
  const [message, setMessage] = useState(
    `Hey ${partner.name.split(' ')[0]}! I saw your profile on SkillSwap. I can help teach you ${offeredSkill} and would love to learn ${requestedSkill} from you!`
  );
  const [isSent, setIsSent] = useState(false);

  // Suggested exchange plan & compatibility score
  const matchResult = matchingService.calculateCompatibility(currentUser, partner);
  const plan = matchingService.generateExchangePlan(offeredSkill, requestedSkill, partner.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.createMatchRequest({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderPhoto: currentUser.photoURL,
      senderCollege: currentUser.collegeName,
      receiverId: partner.id,
      receiverName: partner.name,
      receiverPhoto: partner.photoURL,
      offeredSkillName: offeredSkill,
      requestedSkillName: requestedSkill,
      message,
      status: 'pending'
    });

    try {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 }
      });
    } catch {}

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 1400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--color-soft)',
              color: 'var(--color-primary)'
            }}
          >
            <Repeat className="w-4 h-4" />
          </div>
          <span
            className="text-lg font-medium"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-heading)'
            }}
          >
            Propose Skill Exchange
          </span>
        </div>
      }
      subtitle={
        <div className="flex flex-wrap items-center gap-2 mt-1" style={{ color: 'var(--color-muted)' }}>
          <span>With {partner.name} ({partner.collegeName})</span>
          <MatchScoreBadge score={matchResult.score} size="sm" showBar={false} />
        </div>
      }
      maxWidth="lg"
    >
      {isSent ? (
        <div className="p-8 text-center space-y-3">
          <div
            className="w-14 h-14 rounded-full mx-auto flex items-center justify-center animate-bounce"
            style={{
              backgroundColor: 'var(--color-soft)',
              color: 'var(--color-primary)'
            }}
          >
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3
            className="text-lg font-medium"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            Skill Exchange Request Sent!
          </h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--color-muted)' }}>
            We notified {partner.name}. Once accepted, a shared learning chat will automatically open!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {partner.isAvailableForLiveSession && (
            <div
              className="p-3 rounded-xl flex items-center gap-2.5 text-xs"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)'
              }}
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <span
                  className="relative inline-flex rounded-full h-2.5 w-2.5"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              </span>
              <span style={{ color: 'var(--color-text)' }}>
                <strong>{partner.name} is Available for Live Session!</strong> They are ready to connect for an immediate live swap.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                You Will Teach:
              </label>
              <select
                value={offeredSkill}
                onChange={e => setOfferedSkill(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-soft)',
                  color: 'var(--color-text)'
                }}
              >
                {mySkills.length > 0 ? (
                  mySkills.map(s => (
                    <option key={s.id} value={s.skillName}>
                      {s.skillName} ({s.level})
                    </option>
                  ))
                ) : (
                  <option value="Programming">Programming</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                You Want to Learn:
              </label>
              <select
                value={requestedSkill}
                onChange={e => setRequestedSkill(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-soft)',
                  color: 'var(--color-text)'
                }}
              >
                {partnerSkills.length > 0 ? (
                  partnerSkills.map(s => (
                    <option key={s.id} value={s.skillName}>
                      {s.skillName} ({s.level})
                    </option>
                  ))
                ) : (
                  <option value="Design">Design</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Personalized Exchange Proposal Note
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          {/* AI Exchange Syllabus Preview */}
          <div
            className="p-3.5 space-y-2"
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-soft)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <div
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended 4-Week Mutual Exchange Plan</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div
                className="p-2 rounded-xl"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-soft)',
                  color: 'var(--color-text)'
                }}
              >
                <span className="font-medium" style={{ color: 'var(--color-primary)' }}>W1-2:</span> Foundations & Syntax
              </div>
              <div
                className="p-2 rounded-xl"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-soft)',
                  color: 'var(--color-text)'
                }}
              >
                <span className="font-medium" style={{ color: 'var(--color-primary)' }}>W3-4:</span> Joint Hands-On Project
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-full cursor-pointer hover:bg-[var(--color-soft)] transition-colors"
              style={{
                border: '1px solid var(--color-soft)',
                color: 'var(--color-muted)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium rounded-full flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
              style={{
                backgroundColor: 'var(--color-soft)',
                color: 'var(--color-primary)'
              }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Skill Exchange Request</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
