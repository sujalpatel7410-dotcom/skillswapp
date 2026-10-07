import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES: Record<string, string> = {
    '/': 'SkillSwap — Learn by Teaching',
    '/how-it-works': 'How It Works — SkillSwap',
    '/pricing': 'Business Model & Pricing — SkillSwap',
    '/dashboard': 'Dashboard — SkillSwap',
    '/matches': 'AI Skill Matches — SkillSwap',
    '/discover': 'Discover Campus Peers — SkillSwap',
    '/messages': 'Messages — SkillSwap',
    '/sessions': 'Exchange Sessions — SkillSwap',
    '/skills': 'My Skills — SkillSwap',
    '/progress': 'Learning Progress — SkillSwap',
    '/leaderboard': 'Campus Leaderboard — SkillSwap',
    '/badges': 'Achievement Badges — SkillSwap',
    '/profile': 'Student Profile — SkillSwap',
    '/settings': 'Account Settings — SkillSwap',
    '/admin': 'Admin Center — SkillSwap',
};

const ROUTE_DESCRIPTIONS: Record<string, string> = {
    '/': 'Exchange skills with students, find learning partners, and grow together. One skill in, one skill out.',
    '/how-it-works': 'Discover how SkillSwap matches students for peer-to-peer skill exchanges on campus.',
    '/pricing': 'SkillSwap is free for students. Learn about our campus partnership and premium tiers.',
    '/dashboard': 'Your personal campus dashboard — view your matches, sessions, and learning progress.',
    '/matches': 'Find AI-powered skill match recommendations from your campus and partner colleges.',
    '/discover': 'Browse all campus students, filter by skill, and find your next learning partner.',
    '/messages': 'Chat with your skill exchange partners and schedule sessions.',
    '/sessions': 'View and manage your upcoming and past skill exchange sessions.',
    '/skills': 'Manage the skills you teach and the skills you want to learn.',
    '/progress': 'Track your learning streak, session history, and weekly practice hours.',
    '/leaderboard': 'See top-ranked students across partner campuses by teaching hours and ratings.',
    '/badges': 'Collect achievement badges for milestones in your learning and teaching journey.',
    '/settings': 'Manage your profile, password, notifications, and data privacy settings.',
};

export function usePageTitle(customTitle?: string) {
    const location = useLocation();

    useEffect(() => {
        const isProfileRoute = location.pathname.startsWith('/profile/');
        const baseTitle = customTitle
            ? `${customTitle} — SkillSwap`
            : ROUTE_TITLES[location.pathname]
            ?? (isProfileRoute ? 'Student Profile — SkillSwap' : 'SkillSwap — Learn by Teaching');

        document.title = baseTitle;

        // Update meta description dynamically
        const description = ROUTE_DESCRIPTIONS[location.pathname]
            ?? 'Exchange skills with students, find learning partners, and grow together on SkillSwap.';

        let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        if (metaDesc) {
            metaDesc.content = description;
        }
    }, [location.pathname, customTitle]);
}
