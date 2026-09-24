import { User, AIMatchResult, UserSkill } from '../types';
import { storageService } from './storageService';

export class MatchingService {
  /**
   * Deterministic matching algorithm scoring function
   * Evaluates pairwise compatibility between currentUser and candidate student:
   *
   * 1. Direct Skill In/Out Exchange (Mutual Match):
   *    - candidate teaches what user wants (up to 35 pts)
   *    - user teaches what candidate wants (up to 30 pts)
   * 2. Skill Level Complementarity (up to 12 pts)
   * 3. College Proximity & Trust (up to 8 pts)
   * 4. Availability Overlap (up to 8 pts)
   * 5. Peer Rating & Reliability Weight (up to 7 pts)
   *
   * Normalized strictly from 0 to 100.
   */
  public calculateMatchScore(
    currentUser: User,
    candidate: User,
    userSkills: UserSkill[],
    candidateSkills: UserSkill[]
  ): AIMatchResult | null {
    if (currentUser.id === candidate.id) return null;

    // What user wants to learn
    const userWants = userSkills.filter(s => s.userId === currentUser.id && s.type === 'learn');
    // What user can teach
    const userTeaches = userSkills.filter(s => s.userId === currentUser.id && s.type === 'teach');

    // What candidate wants to learn
    const candidateWants = candidateSkills.filter(s => s.userId === candidate.id && s.type === 'learn');
    // What candidate can teach
    const candidateTeaches = candidateSkills.filter(s => s.userId === candidate.id && s.type === 'teach');

    // Cross-match: candidate teaches what user wants
    const canTeachYou = candidateTeaches.filter(ct =>
      userWants.some(uw => this.isSkillMatch(ct.skillName, uw.skillName))
    );

    // Cross-match: user teaches what candidate wants
    const wantsFromYou = userTeaches.filter(ut =>
      candidateWants.some(cw => this.isSkillMatch(ut.skillName, cw.skillName))
    );

    // If there is no overlap in either direction, low relevance
    if (canTeachYou.length === 0 && wantsFromYou.length === 0) {
      return null;
    }

    const reasons: string[] = [];

    // 1. Skill Compatibility (Candidate teaches what User wants) -> Max 35
    let skillCompatibility = 0;
    if (canTeachYou.length > 0) {
      skillCompatibility = Math.min(35, canTeachYou.length * 25 + 10);
      reasons.push(`Teaches ${canTeachYou.map(s => s.skillName).join(', ')} which you want to learn`);
    }

    // 2. Learning Compatibility (User teaches what Candidate wants) -> Max 30
    let learningCompatibility = 0;
    if (wantsFromYou.length > 0) {
      learningCompatibility = Math.min(30, wantsFromYou.length * 20 + 10);
      reasons.push(`Wants to learn ${wantsFromYou.map(s => s.skillName).join(', ')} from you`);
    }

    // 3. Skill Level Compatibility -> Max 12
    let skillLevelCompatibility = 0;
    let levelMatchCount = 0;
    canTeachYou.forEach(ct => {
      if (ct.level === 'Advanced' || ct.level === 'Expert') {
        levelMatchCount += 1;
      }
    });
    if (levelMatchCount > 0) {
      skillLevelCompatibility = 12;
      reasons.push('High-level expertise in requested subjects');
    } else {
      skillLevelCompatibility = 7;
    }

    // 4. College Compatibility -> Max 8
    let collegeCompatibility = 0;
    if (currentUser.collegeId && candidate.collegeId && currentUser.collegeId === candidate.collegeId) {
      collegeCompatibility = 8;
      reasons.push(`Same campus (${candidate.collegeName}) — easy offline study sessions`);
    } else {
      collegeCompatibility = 4;
    }

    // 5. Availability Compatibility -> Max 8 (+ live session readiness)
    let availabilityCompatibility = 0;
    const userAvail = currentUser.availability || [];
    const candidateAvail = candidate.availability || [];
    const sharedAvail = userAvail.filter(a => candidateAvail.includes(a));
    if (sharedAvail.length > 0) {
      availabilityCompatibility = 8;
      reasons.push(`Compatible schedule: ${sharedAvail[0]}`);
    } else {
      availabilityCompatibility = 4;
    }

    if (candidate.isAvailableForLiveSession) {
      availabilityCompatibility = Math.min(10, availabilityCompatibility + 2);
      reasons.unshift('Available for Live Session right now');
    }

    // 6. Rating & Session Reliability -> Max 7
    let ratingWeight = 0;
    if (candidate.rating >= 4.8) {
      ratingWeight = 7;
      reasons.push(`Exceptional student rating (${candidate.rating}★)`);
    } else if (candidate.rating >= 4.5) {
      ratingWeight = 5;
    } else {
      ratingWeight = 3;
    }

    const rawScore =
      skillCompatibility +
      learningCompatibility +
      skillLevelCompatibility +
      collegeCompatibility +
      availabilityCompatibility +
      ratingWeight;

    // Normalize to 0-100 (capped at 98 for realistic humility unless perfect match)
    const score = Math.min(99, Math.max(20, Math.round(rawScore)));

    return {
      partner: candidate,
      score,
      canTeachYou,
      wantsFromYou,
      reasons,
      compatibilityBreakdown: {
        skillCompatibility,
        learningCompatibility,
        skillLevelCompatibility,
        collegeCompatibility,
        availabilityCompatibility,
        ratingWeight
      }
    };
  }

  private isSkillMatch(skillA: string, skillB: string): boolean {
    const a = skillA.toLowerCase().trim();
    const b = skillB.toLowerCase().trim();
    if (a === b) return true;
    if (a.includes(b) || b.includes(a)) return true;
    // Synonyms
    if ((a.includes('web') && b.includes('react')) || (a.includes('react') && b.includes('web'))) return true;
    if ((a.includes('ml') && b.includes('machine learning')) || (a.includes('machine learning') && b.includes('ml'))) return true;
    if ((a.includes('ui') && b.includes('figma')) || (a.includes('figma') && b.includes('design'))) return true;
    return false;
  }

  /**
   * Find top AI matches for a given user
   */
  public getTopMatches(userId?: string): AIMatchResult[] {
    const current = userId ? storageService.getUserById(userId) || storageService.getCurrentUser() : storageService.getCurrentUser();
    if (!current) return [];
    const allUsers = storageService.getUsers().filter(u => u.id !== current.id && !u.isSuspended);
    const allUserSkills = storageService.getUserSkills();

    const matches: AIMatchResult[] = [];

    for (const candidate of allUsers) {
      const result = this.calculateMatchScore(current, candidate, allUserSkills, allUserSkills);
      if (result) {
        matches.push(result);
      }
    }

    // Sort descending by score
    matches.sort((a, b) => b.score - a.score);
    return matches;
  }

  /**
   * Helper to get compatibility score between two users
   */
  public calculateCompatibility(userA: User, userB: User): { score: number } {
    const allUserSkills = storageService.getUserSkills();
    const result = this.calculateMatchScore(userA, userB, allUserSkills, allUserSkills);
    if (result) return result;
    const sameCollege = userA.collegeName?.toLowerCase() === userB.collegeName?.toLowerCase();
    return { score: sameCollege ? 68 : 55 };
  }

  /**
   * AI Learning Exchange Plan Generator
   * Generates a tailored 4-week peer syllabus for a matched pair
   */
  public generateExchangePlan(
    offeredSkill: string,
    requestedSkill: string,
    partnerName: string
  ): {
    headline: string;
    weeks: { week: number; focus: string; outcome: string }[];
  } {
    return {
      headline: `Balanced 4-Week Skill Swap: ${offeredSkill} ⇄ ${requestedSkill}`,
      weeks: [
        {
          week: 1,
          focus: `Fundamentals & Setup: Core concepts of ${offeredSkill} & ${requestedSkill}`,
          outcome: 'Both partners setup development/design environment and execute hello-world exercises.'
        },
        {
          week: 2,
          focus: `Deep Dive & Best Practices: Real-world syntax, shortcuts & common pitfalls`,
          outcome: 'Hands-on live coding / designing with real-time peer code review.'
        },
        {
          week: 3,
          focus: `Practical Joint Project: Building a working component or design asset`,
          outcome: 'Synthesizing knowledge into a portfolio-ready artifact.'
        },
        {
          week: 4,
          focus: `Review, Advanced Tips & Mutual Retrospective`,
          outcome: 'Mutual 5-star session review, badge unlocks, and next steps roadmap.'
        }
      ]
    };
  }
}

export const matchingService = new MatchingService();
