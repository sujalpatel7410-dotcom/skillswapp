import React, { useState, useEffect } from 'react';
import {
  Video,
  Calendar,
  Clock,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Star,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { User, LearningSession } from '../../types';
import { storageService } from '../../services/storageService';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import { Rating } from '../ui/Rating';

interface SessionsViewProps {
  currentUser: User;
  onJoinCall: (session: LearningSession) => void;
  onOpenChatWith: (partnerId: string) => void;
  onNavigate: (route: string) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  currentUser,
  onJoinCall,
  onOpenChatWith,
  onNavigate
}) => {
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // New session state
  const [partnerId, setPartnerId] = useState('');
  const [skillName, setSkillName] = useState('Python');
  const [timeSlot, setTimeSlot] = useState('6:00 PM - 7:00 PM');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionNotes, setSessionNotes] = useState('Hands-on project walk-through and debugging');

  useEffect(() => {
    const update = () => {
      setSessions(storageService.getSessions(currentUser.id));
    };
    update();
    const unsub = storageService.subscribe(update);
    return () => unsub();
  }, [currentUser.id]);

  const allUsers = storageService.getUsers().filter(u => u.id !== currentUser.id);
  const mySkills = storageService.getUserSkills(currentUser.id);

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' || s.status === 'in-progress');
  const pastSessions = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled');

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPartner = allUsers.find(u => u.id === partnerId) || allUsers[0];
    if (!selectedPartner) return;

    storageService.createSession({
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      teacherPhoto: currentUser.photoURL,
      teacherCollege: currentUser.collegeName,
      learnerId: selectedPartner.id,
      learnerName: selectedPartner.name,
      learnerPhoto: selectedPartner.photoURL,
      learnerCollege: selectedPartner.collegeName,
      skillId: `sk-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      skillName: skillName,
      timeSlot: timeSlot,
      durationMinutes: 60,
      meetingLink: 'https://skillswap.campus/meet/' + Date.now(),
      scheduledAt: new Date(scheduledDate).toISOString(),
      status: 'scheduled',
      notes: sessionNotes
    });

    setIsScheduleModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-medium tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            Exchange Learning Sessions
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Scheduled 1-on-1 live peer exchanges with collaborative video, screen sharing, and mutual reviews.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (allUsers.length > 0 && !partnerId) {
              setPartnerId(allUsers[0].id);
            }
            setIsScheduleModalOpen(true);
          }}
          className="px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
          style={{
            backgroundColor: 'var(--color-soft)',
            color: 'var(--color-primary)'
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Session</span>
        </button>
      </div>

      {/* Upcoming Sessions Section */}
      <div className="space-y-4">
        <h2
          className="text-base font-medium flex items-center gap-2"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
        >
          <Calendar className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <span>Upcoming Sessions ({upcomingSessions.length})</span>
        </h2>

        {upcomingSessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No sessions scheduled yet"
            description="Find a skill partner from matches or campus discovery and book your first 1-on-1 exchange."
            actionLabel="Browse Campus Matches"
            onAction={() => onNavigate('/matches')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSessions.map(sess => {
              const isTeacher = sess.teacherId === currentUser.id;
              const partnerName = isTeacher ? sess.learnerName : sess.teacherName;
              const partnerPhoto = isTeacher ? sess.learnerPhoto : sess.teacherPhoto;
              const partnerCollege = isTeacher ? sess.learnerCollege : sess.teacherCollege;
              const otherId = isTeacher ? sess.learnerId : sess.teacherId;

              return (
                <div
                  key={sess.id}
                  className="p-6 flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-soft)',
                    borderRadius: 'var(--radius-card)'
                  }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={partnerPhoto}
                          alt={partnerName}
                          className="w-12 h-12 rounded-full object-cover"
                          style={{ border: '1px solid var(--color-soft)' }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4
                              className="font-medium text-sm"
                              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                            >
                              {partnerName}
                            </h4>
                            <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                          </div>
                          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                            {partnerCollege}
                          </p>
                        </div>
                      </div>

                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: 'var(--color-soft)',
                          color: 'var(--color-primary)'
                        }}
                      >
                        {isTeacher ? 'You are Teaching' : 'You are Learning'}
                      </span>
                    </div>

                    <div
                      className="p-3.5 rounded-xl space-y-1.5 text-xs mb-4"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-soft)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span style={{ color: 'var(--color-muted)' }}>Subject / Skill:</span>
                        <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                          {sess.skillName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ color: 'var(--color-muted)' }}>Date & Slot:</span>
                        <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                          {new Date(sess.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {sess.timeSlot}
                        </span>
                      </div>
                      {sess.notes && (
                        <div className="pt-1 text-[11px] italic" style={{ color: 'var(--color-muted)' }}>
                          "{sess.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="pt-3 flex items-center justify-between gap-2"
                    style={{ borderTop: '1px solid var(--color-soft)' }}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenChatWith(otherId)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        border: '1px solid var(--color-soft)',
                        color: 'var(--color-text)'
                      }}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onJoinCall(sess)}
                      className="px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
                      style={{
                        backgroundColor: 'var(--color-soft)',
                        color: 'var(--color-primary)'
                      }}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Enter Video Room</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Completed Sessions */}
      <div className="space-y-4 pt-4" style={{ borderTop: '1px solid var(--color-soft)' }}>
        <h2
          className="text-base font-medium flex items-center gap-2"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
        >
          <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <span>Completed History ({pastSessions.length})</span>
        </h2>

        {pastSessions.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Completed peer sessions will appear here.</p>
        ) : (
          <div className="space-y-3">
            {pastSessions.map(s => {
              const isTeacher = s.teacherId === currentUser.id;
              const partnerName = isTeacher ? s.learnerName : s.teacherName;
              return (
                <div
                  key={s.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-soft)',
                    borderRadius: 'var(--radius-card)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-medium"
                      style={{
                        backgroundColor: 'var(--color-soft)',
                        color: 'var(--color-primary)'
                      }}
                    >
                      ✓
                    </div>
                    <div>
                      <h4
                        className="font-medium"
                        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                      >
                        {s.skillName} with {partnerName}
                      </h4>
                      <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                        Completed on {new Date(s.scheduledAt).toLocaleDateString()} • {s.timeSlot}
                      </p>
                    </div>
                  </div>

                  {s.reviewRating && (
                    <div className="flex items-center gap-2">
                      <Rating value={s.reviewRating} size="sm" />
                      <span className="text-[11px] italic max-w-xs truncate" style={{ color: 'var(--color-muted)' }}>
                        "{s.reviewComment}"
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule a Peer Learning Session"
        subtitle="Coordinate date, time, and exchange topic"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Select Campus Partner:
            </label>
            <select
              value={partnerId}
              onChange={e => setPartnerId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)',
                color: 'var(--color-text)'
              }}
            >
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.collegeName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Exchange Topic / Skill:
            </label>
            <input
              type="text"
              required
              value={skillName}
              onChange={e => setSkillName(e.target.value)}
              placeholder="e.g. Python, Figma, React, C++"
              className="w-full px-3 py-2 rounded-xl outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                Date:
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-soft)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
            <div>
              <label className="block font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                Time Slot:
              </label>
              <select
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-soft)',
                  color: 'var(--color-text)'
                }}
              >
                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                <option value="6:00 PM - 7:00 PM">6:00 PM - 7:00 PM</option>
                <option value="8:00 PM - 9:00 PM">8:00 PM - 9:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Session Agenda / Focus Area:
            </label>
            <textarea
              rows={2}
              value={sessionNotes}
              onChange={e => setSessionNotes(e.target.value)}
              placeholder="What specifically will you both focus on?"
              className="w-full px-3 py-2 rounded-xl outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 rounded-full cursor-pointer hover:opacity-75 transition-opacity"
              style={{
                border: '1px solid var(--color-soft)',
                color: 'var(--color-muted)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-medium rounded-full cursor-pointer hover:opacity-85 transition-opacity"
              style={{
                backgroundColor: 'var(--color-soft)',
                color: 'var(--color-primary)'
              }}
            >
              Confirm & Book Session
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
