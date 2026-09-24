import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Video,
  Calendar,
  Code,
  Paperclip,
  Check,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { User, Conversation, Message, LearningSession } from '../../types';
import { storageService } from '../../services/storageService';
import { EmptyState } from '../ui/EmptyState';

interface ChatViewProps {
  currentUser: User;
  activePartnerId?: string | null;
  onNavigate: (route: string) => void;
  onStartVideoSession: (session: Partial<LearningSession>) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentUser,
  activePartnerId,
  onNavigate,
  onStartVideoSession
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isCodeSnippet, setIsCodeSnippet] = useState(false);
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const partnerTypingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const myTypingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Initialize or select partner conversation
  useEffect(() => {
    const update = () => {
      const convos = storageService.getConversations(currentUser.id);
      setConversations(convos);

      if (activePartnerId) {
        let convo = convos.find(c => c.participantIds?.includes(activePartnerId));
        if (!convo) {
          convo = storageService.getOrCreateConversation(currentUser.id, activePartnerId);
          setConversations(storageService.getConversations(currentUser.id));
        }
        if (convo) {
          setSelectedConvoId(convo.id);
        }
      } else if (!selectedConvoId && convos.length > 0) {
        setSelectedConvoId(convos[0].id);
      }
    };

    update();
    const unsub = storageService.subscribe(update);
    return () => unsub();
  }, [currentUser.id, activePartnerId]);

  // Load messages and subscribe to storage updates for selected conversation
  useEffect(() => {
    if (!selectedConvoId) {
      setMessages([]);
      setPartnerIsTyping(false);
      return;
    }
    const msgs = storageService.getMessages(selectedConvoId);
    setMessages(msgs);
    storageService.markConversationAsRead(selectedConvoId, currentUser.id);

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }, [selectedConvoId]);

  // Supabase Realtime channel subscription for active conversation (instant messages, typing, read receipts)
  useEffect(() => {
    if (!selectedConvoId) return;

    setPartnerIsTyping(false);

    const unsubRealtime = storageService.subscribeToConversationRealtime(selectedConvoId, {
      onNewMessage: (newMsg) => {
        if (newMsg.conversationId !== selectedConvoId) return;

        // Reset partner typing state upon message receipt
        setPartnerIsTyping(false);
        if (partnerTypingTimerRef.current) {
          clearTimeout(partnerTypingTimerRef.current);
        }

        setMessages(prev => {
          const exists = prev.some(m => m.id === newMsg.id);
          if (exists) {
            return prev.map(m => m.id === newMsg.id ? newMsg : m);
          }
          return [...prev, newMsg];
        });

        // Automatically mark as read if current user is actively looking at this conversation
        if (newMsg.senderId !== currentUser.id) {
          storageService.markConversationAsRead(selectedConvoId, currentUser.id);
        }

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      },
      onTyping: ({ userId, isTyping }) => {
        if (userId === currentUser.id) return;

        if (isTyping) {
          setPartnerIsTyping(true);
          if (partnerTypingTimerRef.current) {
            clearTimeout(partnerTypingTimerRef.current);
          }
          // Safety timeout in case no stop event is received
          partnerTypingTimerRef.current = setTimeout(() => {
            setPartnerIsTyping(false);
          }, 3500);
        } else {
          setPartnerIsTyping(false);
          if (partnerTypingTimerRef.current) {
            clearTimeout(partnerTypingTimerRef.current);
          }
        }
      },
      onReadReceipt: ({ readerId }) => {
        if (readerId === currentUser.id) return;
        // The partner read our messages! Update read status on all our messages instantly
        setMessages(prev =>
          prev.map(m => (m.senderId === currentUser.id ? { ...m, read: true } : m))
        );
      }
    });

    return () => {
      unsubRealtime();
      if (partnerTypingTimerRef.current) clearTimeout(partnerTypingTimerRef.current);
      if (myTypingTimerRef.current) clearTimeout(myTypingTimerRef.current);
      if (isTypingRef.current && selectedConvoId) {
        storageService.broadcastTyping(selectedConvoId, currentUser.id, currentUser.name, false);
        isTypingRef.current = false;
      }
    };
  }, [selectedConvoId, currentUser.id, currentUser.name]);

  // Keep messages in sync when storageService updates (e.g. from background fetch or global realtime)
  useEffect(() => {
    const handleStorageSync = () => {
      if (selectedConvoId) {
        const msgs = storageService.getMessages(selectedConvoId);
        setMessages(msgs);
      }
    };
    const unsub = storageService.subscribe(handleStorageSync);
    return () => unsub();
  }, [selectedConvoId]);

  // Auto-scroll when messages length changes or partner types
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, partnerIsTyping]);

  const activeConvo = conversations.find(c => c.id === selectedConvoId);
  const partnerEntry = activeConvo?.participants.find(p => p.id !== currentUser.id);
  const partner = partnerEntry ? storageService.getUserById(partnerEntry.id) : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (!selectedConvoId) return;

    if (!isTypingRef.current && val.trim().length > 0) {
      isTypingRef.current = true;
      storageService.broadcastTyping(selectedConvoId, currentUser.id, currentUser.name, true);
    }

    if (myTypingTimerRef.current) {
      clearTimeout(myTypingTimerRef.current);
    }

    myTypingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      if (selectedConvoId) {
        storageService.broadcastTyping(selectedConvoId, currentUser.id, currentUser.name, false);
      }
    }, 2000);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedConvoId) return;

    // Immediately stop typing indicator
    if (myTypingTimerRef.current) clearTimeout(myTypingTimerRef.current);
    isTypingRef.current = false;
    storageService.broadcastTyping(selectedConvoId, currentUser.id, currentUser.name, false);

    storageService.sendMessage({
      conversationId: selectedConvoId,
      senderId: currentUser.id,
      text: inputText.trim(),
      isCodeSnippet: isCodeSnippet
    });

    setInputText('');
    setIsCodeSnippet(false);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleLaunchDirectCall = () => {
    if (!partner) return;
    const session: Partial<LearningSession> = {
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      teacherPhoto: currentUser.photoURL,
      learnerId: partner.id,
      learnerName: partner.name,
      learnerPhoto: partner.photoURL,
      skillName: 'Peer Skill Exchange',
      timeSlot: 'Live Now',
      scheduledAt: new Date().toISOString(),
      status: 'in-progress'
    };
    onStartVideoSession(session);
  };

  return (
    <div
      className="h-[calc(100vh-8.5rem)] flex overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-soft)',
        borderRadius: 'var(--radius-card)'
      }}
    >
      {/* Conversations List (Left Sidebar) */}
      <div
        className="w-80 flex flex-col shrink-0"
        style={{ borderRight: '1px solid var(--color-soft)' }}
      >
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--color-soft)' }}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <h2
              className="font-medium text-sm"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              Campus Messages
            </h2>
          </div>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-soft)',
              color: 'var(--color-primary)'
            }}
          >
            {conversations.length} Active
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
              No conversations yet. Propose a skill exchange to start chatting!
            </div>
          ) : (
            conversations.map(c => {
              const otherPart = c.participants.find(p => p.id !== currentUser.id);
              const otherUser = otherPart ? storageService.getUserById(otherPart.id) : null;
              const isSelected = c.id === selectedConvoId;
              const unread = c.unreadCount?.[currentUser.id] || 0;

              if (!otherUser) return null;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedConvoId(c.id);
                    storageService.markConversationAsRead(c.id, currentUser.id);
                  }}
                  className="p-3.5 flex items-center gap-3 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-soft)' : 'transparent',
                    borderBottom: '1px solid var(--color-soft)'
                  }}
                >
                  <div className="relative shrink-0">
                    <img
                      src={otherUser.photoURL}
                      alt={otherUser.name}
                      className="w-11 h-11 rounded-full object-cover"
                      style={{ border: '1px solid var(--color-soft)' }}
                    />
                    <span
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        border: '2px solid var(--color-surface)'
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className="text-xs font-medium truncate flex items-center gap-1"
                        style={{ color: 'var(--color-text)' }}
                      >
                        <span>{otherUser.name}</span>
                        {otherUser.verificationStatus === 'verified' && (
                          <ShieldCheck className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                        )}
                      </h4>
                      <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                        {c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      {isSelected && partnerIsTyping ? (
                        <span className="text-[11px] font-medium animate-pulse" style={{ color: 'var(--color-primary)' }}>
                          typing...
                        </span>
                      ) : (
                        c.lastMessage?.text || 'Started a conversation'
                      )}
                    </p>
                  </div>

                  {unread > 0 && (
                    <span
                      className="min-w-4 h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 text-white shadow-xs"
                      style={{
                        backgroundColor: 'var(--color-primary)'
                      }}
                    >
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Area (Right) */}
      <div
        className="flex-1 flex flex-col"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {partner && activeConvo ? (
          <>
            {/* Chat Header */}
            <div
              className="px-6 py-3.5 flex items-center justify-between"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-soft)'
              }}
            >
              <div
                onClick={() => onNavigate(`/profile?userId=${partner.id}`)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={partner.photoURL}
                  alt={partner.name}
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ border: '1px solid var(--color-soft)' }}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3
                      className="text-sm font-medium transition-colors"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {partner.name}
                    </h3>
                    {partner.verificationStatus === 'verified' && (
                      <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                    )}
                  </div>
                  {partnerIsTyping ? (
                    <span
                      className="text-[11px] flex items-center gap-1.5 font-medium animate-pulse"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                      <span>typing...</span>
                    </span>
                  ) : (
                    <span
                      className="text-[11px] flex items-center gap-1 font-medium"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                      Online on campus ({partner.collegeName})
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Actions in Chat Header */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/sessions')}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[var(--color-soft)] transition-colors"
                  style={{
                    border: '1px solid var(--color-soft)',
                    color: 'var(--color-muted)'
                  }}
                  title="Schedule a formal session"
                >
                  <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                  <span>Book Session</span>
                </button>

                <button
                  type="button"
                  onClick={handleLaunchDirectCall}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-85 transition-opacity"
                  style={{
                    backgroundColor: 'var(--color-soft)',
                    color: 'var(--color-primary)'
                  }}
                  title="Launch video call room"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Start Video Exchange</span>
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
              {/* Security & Student Trust Notice */}
              <div className="text-center my-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-soft)',
                    color: 'var(--color-muted)'
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                  Encrypted student peer exchange chat • Keep communication respectful
                </span>
              </div>

              {messages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className="max-w-md sm:max-w-lg px-4 py-2.5 text-xs sm:text-sm"
                      style={{
                        backgroundColor: isMe ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: isMe ? '#FFFFFF' : 'var(--color-text)',
                        border: isMe ? 'none' : '1px solid var(--color-soft)',
                        borderRadius: 'var(--radius-card)'
                      }}
                    >
                      {msg.isCodeSnippet ? (
                        <div
                          className="font-mono text-xs p-3 rounded-xl overflow-x-auto my-1"
                          style={{
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)',
                            border: '1px solid var(--color-soft)'
                          }}
                        >
                          <code>{msg.text}</code>
                        </div>
                      ) : (
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      )}
                    </div>
                    <span
                      className="text-[10px] mt-1 flex items-center gap-1.5 px-1"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && (
                        msg.read ? (
                          <span
                            className="inline-flex items-center gap-0.5 font-medium"
                            style={{ color: 'var(--color-primary)' }}
                            title="Read by recipient"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span className="text-[9px]">Read</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-0.5"
                            style={{ color: 'var(--color-muted)' }}
                            title="Delivered to recipient"
                          >
                            <Check className="w-3 h-3" />
                            <span className="text-[9px]">Sent</span>
                          </span>
                        )
                      )}
                    </span>
                  </div>
                );
              })}

              {/* Animated typing indicator bubble */}
              {partnerIsTyping && (
                <div className="flex items-center gap-2 py-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div
                    className="px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-xs"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-soft)'
                    }}
                  >
                    <span className="flex gap-1 items-center">
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                    </span>
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      {partner.name} is typing...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 flex items-center gap-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderTop: '1px solid var(--color-soft)'
              }}
            >
              <button
                type="button"
                onClick={() => setIsCodeSnippet(!isCodeSnippet)}
                className="p-2 rounded-full cursor-pointer transition-colors"
                style={{
                  backgroundColor: isCodeSnippet ? 'var(--color-soft)' : 'transparent',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-soft)'
                }}
                title="Send as code snippet"
              >
                <Code className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={isCodeSnippet ? 'Paste code snippet here...' : `Message ${partner.name}...`}
                className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-full outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-soft)',
                  color: 'var(--color-text)'
                }}
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-full cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-40"
                style={{
                  backgroundColor: 'var(--color-soft)',
                  color: 'var(--color-primary)'
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Your learning network starts here"
            description="Find a student from Top Matches or Discovery to propose a skill swap and start a conversation."
            actionLabel="Find Study Partner"
            onAction={() => onNavigate('/matches')}
            className="my-auto"
          />
        )}
      </div>
    </div>
  );
};
