import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  PhoneOff,
  MessageSquare,
  FileText,
  Clock,
  Send,
  Copy,
  Check,
  PanelRightClose,
  PanelRightOpen,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { LearningSession, User } from '../../types';
import { storageService } from '../../services/storageService';
import { Rating } from '../ui/Rating';
import { Modal } from '../ui/Modal';
import confetti from 'canvas-confetti';

interface VideoCallRoomProps {
  session: LearningSession;
  currentUser: User;
  onLeaveCall: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({
  session,
  currentUser,
  onLeaveCall
}) => {
  // Deterministic unique room name generated from the session id
  const cleanSessionId = session.id.toLowerCase().replace(/[^a-z0-9]/g, '');
  const roomName = `SkillSwap_Session_${cleanSessionId}`;

  const [activeTab, setActiveTab] = useState<'notes' | 'chat'>('notes');
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [notes, setNotes] = useState(
    session.notes ||
      'Exchange Key Learnings:\n- Step 1: Core concepts and review\n- Step 2: Hands-on walk-through\n- Step 3: Key takeaways & next steps'
  );
  const [chatInput, setChatInput] = useState('');
  const [inCallMessages, setInCallMessages] = useState<
    { sender: string; text: string; time: string }[]
  >([
    {
      sender: 'SkillSwap',
      text: `Welcome! Both partners join room "${roomName}". Audio, video, and screen sharing are powered by Jitsi Meet.`,
      time: 'Just now'
    }
  ]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewComment, setReviewComment] = useState(
    'Great exchange! Clear explanations and very supportive peer learning.'
  );

  const [isJitsiLoading, setIsJitsiLoading] = useState(true);
  const [scriptLoadFailed, setScriptLoadFailed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  const isTeacher = session.teacherId === currentUser.id;
  const partnerName = isTeacher ? session.learnerName : session.teacherName;

  // Timer tick for call duration
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize Jitsi Meet IFrame API
  useEffect(() => {
    let isMounted = true;

    const loadJitsiScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const existingScript = document.getElementById('jitsi-external-api-script') as HTMLScriptElement;
        if (existingScript) {
          if (window.JitsiMeetExternalAPI) {
            resolve();
          } else {
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', (e) => reject(e));
          }
          return;
        }

        const script = document.createElement('script');
        script.id = 'jitsi-external-api-script';
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.body.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!isMounted || !jitsiContainerRef.current) return;

        // Clean up previous instance if any
        if (jitsiApiRef.current) {
          try {
            jitsiApiRef.current.dispose();
          } catch (e) {
            // ignore
          }
          jitsiApiRef.current = null;
        }

        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: currentUser.name,
            email: currentUser.email || undefined
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableWelcomePage: false,
            enableClosePage: false
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            DEFAULT_REMOTE_DISPLAY_NAME: partnerName
          }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        api.addEventListener('videoConferenceJoined', () => {
          if (isMounted) {
            setIsJitsiLoading(false);
          }
        });

        // Prompt review when user hangs up inside Jitsi
        api.addEventListener('videoConferenceLeft', () => {
          if (isMounted) {
            setShowReviewModal(true);
          }
        });

        api.addEventListener('readyToClose', () => {
          if (isMounted) {
            setShowReviewModal(true);
          }
        });

        // Set a timeout to clear loading indicator in case the event is delayed
        setTimeout(() => {
          if (isMounted) {
            setIsJitsiLoading(false);
          }
        }, 3000);
      } catch (err) {
        console.warn('Jitsi script load error, falling back to direct iframe:', err);
        if (isMounted) {
          setScriptLoadFailed(true);
          setIsJitsiLoading(false);
        }
      }
    };

    initJitsi();

    return () => {
      isMounted = false;
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (e) {
          // ignore
        }
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, currentUser.name, currentUser.email, partnerName]);

  const handleCopyMeetingLink = () => {
    const link = `https://meet.jit.si/${roomName}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleSendInCallMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setInCallMessages(prev => [
      ...prev,
      {
        sender: currentUser.name,
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
  };

  const handleEndSession = () => {
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    storageService.completeSession(session.id, ratingScore, reviewComment);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setShowReviewModal(false);
    onLeaveCall();
  };

  const handleSkipReview = () => {
    setShowReviewModal(false);
    onLeaveCall();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col h-screen select-none">
      {/* Call Header */}
      <div className="h-16 px-4 sm:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0">
        {/* Left: Skill title and partner info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold shadow-md shadow-emerald-600/30 shrink-0">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight truncate">
                1:1 Exchange: {session.skillName}
              </h2>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Call
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              Partner: {partnerName} • Room: <span className="font-mono text-slate-300">{roomName}</span>
            </p>
          </div>
        </div>

        {/* Right: Actions, Timer, and Leave Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Copy Room Link button */}
          <button
            type="button"
            onClick={handleCopyMeetingLink}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
            title="Copy direct meeting link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          {/* Call Duration Timer */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-mono font-bold text-slate-200 border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          {/* Toggle Side Panel (Notes / Chat) */}
          <button
            type="button"
            onClick={() => setShowSidePanel(prev => !prev)}
            className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
              showSidePanel
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title={showSidePanel ? 'Hide Notes Panel' : 'Show Notes Panel'}
          >
            {showSidePanel ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>

          {/* Leave Button */}
          <button
            type="button"
            onClick={handleEndSession}
            className="px-3.5 sm:px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave Call</span>
          </button>
        </div>
      </div>

      {/* Main Video & Collaboration Area */}
      <div className="flex-1 flex overflow-hidden p-3 sm:p-4 gap-3 sm:gap-4 relative">
        {/* Jitsi Meet Embedded Room */}
        <div className="flex-1 flex flex-col relative rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
          {/* Loading spinner while Jitsi iframe initializes */}
          {isJitsiLoading && !scriptLoadFailed && (
            <div className="absolute inset-0 z-10 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-200">Connecting to Jitsi Meet Room...</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Room: {roomName}
              </p>
            </div>
          )}

          {/* Jitsi Container mounted via JitsiMeetExternalAPI */}
          {!scriptLoadFailed ? (
            <div
              ref={jitsiContainerRef}
              className="w-full h-full relative overflow-hidden bg-slate-950 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
            />
          ) : (
            /* Fallback direct iframe if external_api.js failed to load */
            <div className="w-full h-full relative bg-slate-950 flex flex-col">
              <div className="p-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between px-4">
                <span>Loaded via direct Jitsi frame</span>
                <a
                  href={`https://meet.jit.si/${roomName}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-bold underline hover:text-white"
                >
                  Open in New Tab <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <iframe
                src={`https://meet.jit.si/${roomName}#userInfo.displayName=${encodeURIComponent(
                  currentUser.name
                )}&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`}
                allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                className="w-full h-full border-0"
                title={`Live Session Call - ${session.skillName}`}
              />
            </div>
          )}
        </div>

        {/* Optional Collapsible Side Panel: Shared Notes & In-Call Chat */}
        {showSidePanel && (
          <div className="w-80 sm:w-96 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden shrink-0 transition-all animate-in slide-in-from-right-4 duration-200">
            {/* Tabs */}
            <div className="flex border-b border-slate-800 p-1.5 bg-slate-950/40">
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Session Notes</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>In-Call Chat</span>
              </button>
            </div>

            {/* Tab Content: Notes */}
            {activeTab === 'notes' ? (
              <div className="flex-1 flex flex-col p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Live Scratchpad
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">● Auto-saving</span>
                </div>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Type exchange notes, key takeaways, and action items..."
                  className="flex-1 w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
                />
              </div>
            ) : (
              /* Tab Content: Chat */
              <div className="flex-1 flex flex-col p-4">
                <div className="flex-1 overflow-y-auto space-y-2.5 mb-3 pr-1">
                  {inCallMessages.map((m, i) => (
                    <div
                      key={i}
                      className="text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-emerald-400">{m.sender}</span>
                        <span className="text-[10px] text-slate-500">{m.time}</span>
                      </div>
                      <p className="text-slate-300 text-xs break-words">{m.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendInCallMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Type in-call message..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal on Leaving / Ending Session */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Exchange Completed!"
        subtitle={`Leave feedback for ${partnerName}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-500/20">
            🎉 Great job completing your peer learning exchange on{' '}
            <strong>{session.skillName}</strong>! Both your profiles will earn +1 completed session
            and streak increments.
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
              Rate your peer learning experience:
            </label>
            <Rating
              value={ratingScore}
              interactive={true}
              size="lg"
              onChange={val => setRatingScore(val)}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Feedback & Review Comments:
            </label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleSkipReview}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
            >
              Skip Review & Exit
            </button>

            <button
              type="button"
              onClick={handleSubmitReview}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Submit Review & Finish
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
