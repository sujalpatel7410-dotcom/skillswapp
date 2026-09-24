import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Repeat,
  ShieldCheck,
  Clock,
  Building,
  Star,
  CheckCircle2,
  XCircle,
  Clock3,
  MessageSquare,
  BookOpen,
  ArrowRight,
  Radio,
  Video
} from 'lucide-react';
import { User, AIMatchResult, MatchRequest } from '../../types';
import { matchingService } from '../../services/matchingService';
import { storageService } from '../../services/storageService';
import { Rating } from '../ui/Rating';
import { EmptyState } from '../ui/EmptyState';
import { ExchangeRequestModal } from './ExchangeRequestModal';
import { Modal } from '../ui/Modal';
import { MatchScoreBadge } from './MatchScoreBadge';

interface MatchingViewProps {
  currentUser: User;
  onNavigate: (route: string) => void;
  onOpenChatWith: (partnerId: string) => void;
}

export const MatchingView: React.FC<MatchingViewProps> = ({
  currentUser,
  onNavigate,
  onOpenChatWith
}) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'requests'>('matches');
  const [matches, setMatches] = useState<AIMatchResult[]>([]);
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [liveOnlyFilter, setLiveOnlyFilter] = useState(false);
  const [selectedPartnerForSwap, setSelectedPartnerForSwap] = useState<User | null>(null);
  const [selectedMatchDetails, setSelectedMatchDetails] = useState<AIMatchResult | null>(null);

  useEffect(() => {
    const update = () => {
      setMatches(matchingService.getTopMatches(currentUser.id));
      setRequests(storageService.getMatchRequests(currentUser.id));
    };
    update();
    const unsub = storageService.subscribe(update);
    return () => unsub();
  }, [currentUser.id]);

  const liveMatches = matches.filter(m => m.partner.isAvailableForLiveSession);
  const displayedMatches = liveOnlyFilter ? liveMatches : matches;

  const handleAcceptRequest = (reqId: string) => {
    storageService.updateMatchRequestStatus(reqId, 'accepted');
  };

  const handleRejectRequest = (reqId: string) => {
    storageService.updateMatchRequestStatus(reqId, 'rejected');
  };

  const pendingIncoming = requests.filter(r => r.receiverId === currentUser.id && r.status === 'pending');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl font-medium tracking-tight"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              AI Skill Matching Engine
            </h1>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'var(--color-soft)',
                color: 'var(--color-primary)'
              }}
            >
              Active Algorithm
            </span>
          </div>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Recommends compatible campus peers where what you teach balances what they want to learn.
          </p>
        </div>

        {/* Tab Toggle */}
        <div
          className="flex items-center p-1 rounded-full"
          style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-soft)'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('matches')}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === 'matches' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'matches' ? 'var(--color-primary)' : 'var(--color-muted)',
              border: activeTab === 'matches' ? '1px solid var(--color-soft)' : 'none'
            }}
          >
            Top Matches ({matches.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className="relative px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === 'requests' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'requests' ? 'var(--color-primary)' : 'var(--color-muted)',
              border: activeTab === 'requests' ? '1px solid var(--color-soft)' : 'none'
            }}
          >
            Exchange Requests ({requests.length})
            {pendingIncoming.length > 0 && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
              >
                {pendingIncoming.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TOP MATCHES TAB */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          {/* Student's Own Live Status Banner */}
          <div
            className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-soft)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <div className="flex items-start sm:items-center gap-3">
              <span className="relative flex h-3 w-3 mt-1 sm:mt-0 shrink-0">
                {currentUser.isAvailableForLiveSession && (
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                )}
                <span
                  className="relative inline-flex rounded-full h-3 w-3"
                  style={{
                    backgroundColor: currentUser.isAvailableForLiveSession
                      ? 'var(--color-primary)'
                      : 'var(--color-muted)'
                  }}
                />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    Your Status: {currentUser.isAvailableForLiveSession ? 'Available for Live Session' : 'Offline for Instant Swaps'}
                  </span>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--color-soft)',
                      color: currentUser.isAvailableForLiveSession ? 'var(--color-primary)' : 'var(--color-muted)'
                    }}
                  >
                    {currentUser.isAvailableForLiveSession ? 'Live Discovery Active' : 'Scheduled Only'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  {currentUser.isAvailableForLiveSession
                    ? 'Peers on campus see you ready for instant 1-on-1 skill exchanges and live video rooms.'
                    : 'Turn your status on to be featured with live readiness and boosted in match discovery.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => storageService.toggleLiveSessionAvailability(currentUser.id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all self-start sm:self-auto shrink-0 flex items-center gap-1.5"
              style={{
                backgroundColor: currentUser.isAvailableForLiveSession ? 'var(--color-soft)' : 'var(--color-primary)',
                color: currentUser.isAvailableForLiveSession ? 'var(--color-primary)' : '#FFFFFF'
              }}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{currentUser.isAvailableForLiveSession ? 'Mark as Offline' : 'Mark Available for Live'}</span>
            </button>
          </div>

          {/* Quick Sub-Filter for Live Sessions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLiveOnlyFilter(false)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all"
                style={{
                  backgroundColor: !liveOnlyFilter ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: !liveOnlyFilter ? '#FFFFFF' : 'var(--color-muted)',
                  border: !liveOnlyFilter ? 'none' : '1px solid var(--color-soft)'
                }}
              >
                All Recommendations ({matches.length})
              </button>
              <button
                type="button"
                onClick={() => setLiveOnlyFilter(true)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5"
                style={{
                  backgroundColor: liveOnlyFilter ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: liveOnlyFilter ? '#FFFFFF' : 'var(--color-muted)',
                  border: liveOnlyFilter ? 'none' : '1px solid var(--color-soft)'
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: liveOnlyFilter ? '#FFFFFF' : 'var(--color-primary)' }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: liveOnlyFilter ? '#FFFFFF' : 'var(--color-primary)' }}
                  />
                </span>
                <span>Available for Live Session ({liveMatches.length})</span>
              </button>
            </div>

            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Showing {displayedMatches.length} {liveOnlyFilter ? 'live-ready peers' : 'peer matches'}
            </span>
          </div>

          {matches.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="We're still looking."
              description="Add more skills to your profile or update your availability schedule to expand your AI match recommendations."
              actionLabel="Add Teaching & Learning Skills"
              onAction={() => onNavigate('/skills')}
            />
          ) : liveOnlyFilter && displayedMatches.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="No peers currently live"
              description="None of your recommended matches are marked Available for Live Session right now. You can browse all matches or mark yourself live to invite peers."
              actionLabel="Show All Recommendations"
              onAction={() => setLiveOnlyFilter(false)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedMatches.map(m => (
                <div
                  key={m.partner.id}
                  className="p-6 transition-all flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-soft)',
                    borderRadius: 'var(--radius-card)'
                  }}
                >
                  <div>
                    {/* Header with Match % and Partner details */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img
                            src={m.partner.photoURL}
                            alt={m.partner.name}
                            className="w-14 h-14 rounded-full object-cover"
                            style={{ border: '1px solid var(--color-soft)' }}
                          />
                          {m.partner.isAvailableForLiveSession && (
                            <span
                              className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: 'var(--color-surface)' }}
                              title="Available for Live Session"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                              />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3
                              className="font-medium text-base"
                              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                            >
                              {m.partner.name}
                            </h3>
                            {m.partner.verificationStatus === 'verified' && (
                              <span title="Verified Campus Student">
                                <ShieldCheck className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                              </span>
                            )}
                          </div>
                          {m.partner.isAvailableForLiveSession && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="relative flex h-2 w-2">
                                <span
                                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                  style={{ backgroundColor: 'var(--color-primary)' }}
                                />
                                <span
                                  className="relative inline-flex rounded-full h-2 w-2"
                                  style={{ backgroundColor: 'var(--color-primary)' }}
                                />
                              </span>
                              <span
                                className="text-[11px] font-medium"
                                style={{ color: 'var(--color-primary)' }}
                              >
                                Available for Live Session
                              </span>
                            </div>
                          )}
                          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-muted)' }}>
                            <Building className="w-3 h-3 shrink-0" style={{ color: 'var(--color-muted)' }} />
                            <span className="truncate max-w-[180px]">{m.partner.collegeName}</span>
                          </p>
                          <Rating value={m.partner.rating} size="sm" reviewCount={m.partner.reviewCount} />
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <MatchScoreBadge score={m.score} size="md" showBar={true} />
                        <span className="block text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>
                          Calculated compatibility
                        </span>
                      </div>
                    </div>

                    {/* The 4-Way Exchange Box */}
                    <div
                      className="p-4 rounded-xl space-y-3 mb-4 text-xs"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-soft)'
                      }}
                    >
                      <div
                        className="grid grid-cols-2 gap-3 pb-2.5"
                        style={{ borderBottom: '1px solid var(--color-soft)' }}
                      >
                        <div>
                          <span
                            className="text-[10px] font-medium uppercase tracking-wider block"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            Can Teach You:
                          </span>
                          <span className="font-medium text-xs" style={{ color: 'var(--color-text)' }}>
                            {m.canTeachYou.map(s => s.skillName).join(', ') || 'Various subjects'}
                          </span>
                        </div>
                        <div>
                          <span
                            className="text-[10px] font-medium uppercase tracking-wider block"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            Wants to Learn:
                          </span>
                          <span className="font-medium text-xs" style={{ color: 'var(--color-text)' }}>
                            {m.wantsFromYou.map(s => s.skillName).join(', ') || 'Your skills'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span
                            className="text-[10px] font-medium uppercase tracking-wider block"
                            style={{ color: 'var(--color-muted)' }}
                          >
                            You Can Teach:
                          </span>
                          <span className="font-normal text-xs" style={{ color: 'var(--color-text)' }}>
                            {m.wantsFromYou.map(s => s.skillName).join(', ') || 'Python, C++'}
                          </span>
                        </div>
                        <div>
                          <span
                            className="text-[10px] font-medium uppercase tracking-wider block"
                            style={{ color: 'var(--color-muted)' }}
                          >
                            You Want:
                          </span>
                          <span className="font-normal text-xs" style={{ color: 'var(--color-text)' }}>
                            {m.canTeachYou.map(s => s.skillName).join(', ') || 'Photoshop, AI'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Why this match? */}
                    <div className="space-y-1.5 mb-4">
                      <span
                        className="text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Why this match?
                      </span>
                      <ul className="space-y-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                        {m.reasons.slice(0, 3).map((r, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                              style={{ backgroundColor: 'var(--color-primary)' }}
                            />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="pt-4 flex items-center justify-between gap-3"
                    style={{ borderTop: '1px solid var(--color-soft)' }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedMatchDetails(m)}
                      className="text-xs font-medium cursor-pointer hover:underline"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      View AI Score Math
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/profile?userId=${m.partner.id}`)}
                        className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer hover:bg-[var(--color-soft)]"
                        style={{
                          border: '1px solid var(--color-soft)',
                          color: 'var(--color-muted)'
                        }}
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPartnerForSwap(m.partner)}
                        className="px-4 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                        style={{
                          backgroundColor: m.partner.isAvailableForLiveSession ? 'var(--color-primary)' : 'var(--color-soft)',
                          color: m.partner.isAvailableForLiveSession ? '#FFFFFF' : 'var(--color-primary)'
                        }}
                      >
                        {m.partner.isAvailableForLiveSession ? (
                          <>
                            <Video className="w-3.5 h-3.5" />
                            <span>Start Live Swap</span>
                          </>
                        ) : (
                          <>
                            <Repeat className="w-3.5 h-3.5" />
                            <span>Request Skill Exchange</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <EmptyState
              icon={Repeat}
              title="No exchange requests yet."
              description="When peers propose a skill exchange with you, their invitations will appear here for you to accept or decline."
            />
          ) : (
            <div className="space-y-3">
              {requests.map(req => {
                const isIncoming = req.receiverId === currentUser.id;
                return (
                  <div
                    key={req.id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-soft)',
                      borderRadius: 'var(--radius-card)'
                    }}
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={isIncoming ? req.senderPhoto : req.receiverPhoto}
                        alt="Student"
                        className="w-12 h-12 rounded-full object-cover"
                        style={{ border: '1px solid var(--color-soft)' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className="font-medium text-sm"
                            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                          >
                            {isIncoming ? req.senderName : `To: ${req.receiverName}`}
                          </h4>
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase"
                            style={{
                              backgroundColor: 'var(--color-soft)',
                              color: 'var(--color-primary)'
                            }}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-primary)' }}>
                          Offer: {req.offeredSkillName} ⇄ Wants: {req.requestedSkillName}
                        </p>
                        <p className="text-xs mt-1 italic" style={{ color: 'var(--color-muted)' }}>
                          "{req.message}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isIncoming && req.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRejectRequest(req.id)}
                            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer hover:bg-[var(--color-soft)]"
                            style={{
                              border: '1px solid var(--color-soft)',
                              color: 'var(--color-muted)'
                            }}
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAcceptRequest(req.id)}
                            className="px-4 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                            style={{
                              backgroundColor: 'var(--color-soft)',
                              color: 'var(--color-primary)'
                            }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept Swap</span>
                          </button>
                        </>
                      )}

                      {req.status === 'accepted' && (
                        <button
                          type="button"
                          onClick={() => {
                            const partnerId = isIncoming ? req.senderId : req.receiverId;
                            onOpenChatWith(partnerId);
                          }}
                          className="px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                          style={{
                            backgroundColor: 'var(--color-soft)',
                            color: 'var(--color-primary)'
                          }}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open Chat</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Propose Exchange Modal */}
      <ExchangeRequestModal
        isOpen={selectedPartnerForSwap !== null}
        onClose={() => setSelectedPartnerForSwap(null)}
        partner={selectedPartnerForSwap}
      />

      {/* AI Score Calculation Breakdown Modal */}
      <Modal
        isOpen={selectedMatchDetails !== null}
        onClose={() => setSelectedMatchDetails(null)}
        title={
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Compatibility Score Engine</span>
          </div>
        }
        subtitle="Transparent algorithmic breakdown (Normalized 0 - 100)"
      >
        {selectedMatchDetails && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center justify-between text-sm font-bold text-indigo-900 dark:text-indigo-200">
                <span>Total Match Score:</span>
                <MatchScoreBadge score={selectedMatchDetails.score} size="lg" showBar={true} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Skill Compatibility (They teach what you want):</span>
                <strong className="text-slate-900 dark:text-white">
                  +{selectedMatchDetails.compatibilityBreakdown.skillCompatibility} pts
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Learning Compatibility (You teach what they want):</span>
                <strong className="text-slate-900 dark:text-white">
                  +{selectedMatchDetails.compatibilityBreakdown.learningCompatibility} pts
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Skill Level Complementarity:</span>
                <strong className="text-slate-900 dark:text-white">
                  +{selectedMatchDetails.compatibilityBreakdown.skillLevelCompatibility} pts
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Campus / College Proximity:</span>
                <strong className="text-slate-900 dark:text-white">
                  +{selectedMatchDetails.compatibilityBreakdown.collegeCompatibility} pts
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Availability Schedule Overlap:</span>
                <strong className="text-slate-900 dark:text-white">
                  +{selectedMatchDetails.compatibilityBreakdown.availabilityCompatibility} pts
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Peer Rating & Reliability Weight:</span>
                <strong className="text-slate-900 dark:text-white">
                  +{selectedMatchDetails.compatibilityBreakdown.ratingWeight} pts
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              SkillSwap utilizes an explainable scoring function so students understand exactly why two profiles pair well together.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};
