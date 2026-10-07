import 'dotenv/config';
import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const PORT = process.env.API_PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn('[server] WARNING: GEMINI_API_KEY is not set. /api/match-insight will return fallback responses.');
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ----------------------------------------------------------------
// MATCH INSIGHT CACHE
// ----------------------------------------------------------------
interface CachedInsight {
    explanation: string;
    sessionTopic: string;
    cachedAt: number;
}

const insightCache = new Map<string, CachedInsight>();

function makePairKey(userIdA: string, userIdB: string): string {
    return [userIdA, userIdB].sort().join('::');
}

// ----------------------------------------------------------------
// SESSION PLAN CACHE
// ----------------------------------------------------------------
export interface LessonStep {
    timeRange: string;   // e.g. "0–15 min"
    title: string;
    description: string;
}

export interface LessonPlan {
    learningGoal: string;
    steps: LessonStep[];       // exactly 3
    practiceTask: string;
    cachedAt: number;
}

const planCache = new Map<string, LessonPlan>();

// ----------------------------------------------------------------
// POST /api/match-insight
// ----------------------------------------------------------------
app.post('/api/match-insight', async (req: Request, res: Response) => {
    const { currentUser, partner } = req.body ?? {};

    if (!currentUser?.id || !partner?.id) {
        res.status(400).json({ error: 'currentUser.id and partner.id are required.' });
        return;
    }

    const cacheKey = makePairKey(currentUser.id, partner.id);
    const cached = insightCache.get(cacheKey);

    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
        res.json({ explanation: cached.explanation, sessionTopic: cached.sessionTopic, fromCache: true });
        return;
    }

    if (!ai) {
        const fallback: CachedInsight = {
            explanation: `${partner.name} and you share complementary skills and overlapping availability, making you a high-compatibility learning pair on campus. Your skill exchange creates a mutual growth opportunity that benefits both of you equally.`,
            sessionTopic: partner.teachSkills?.[0] ? `Introduction to ${partner.teachSkills[0]}` : 'Getting started with skill exchange',
            cachedAt: Date.now(),
        };
        insightCache.set(cacheKey, fallback);
        res.json({ ...fallback, fromCache: false });
        return;
    }

    const prompt = `You are an AI assistant for SkillSwap, a campus peer-learning platform.

Given these two students' profiles, write:
1. A 2-sentence "Why you match" explanation highlighting the specific complementary skills and shared availability that make them a strong pairing. Be specific, warm, and student-friendly.
2. A suggested first session topic (10 words or fewer) that would be the ideal starting point for their skill exchange.

Student A (the viewer):
- Name: ${currentUser.name}
- Can teach: ${(currentUser.teachSkills ?? []).join(', ') || 'various topics'}
- Wants to learn: ${(currentUser.learnSkills ?? []).join(', ') || 'various topics'}
- Interests: ${(currentUser.interests ?? []).join(', ') || 'not specified'}
- Availability: ${(currentUser.availability ?? []).join(', ') || 'flexible'}

Student B (the match):
- Name: ${partner.name}
- Can teach: ${(partner.teachSkills ?? []).join(', ') || 'various topics'}
- Wants to learn: ${(partner.learnSkills ?? []).join(', ') || 'various topics'}
- Interests: ${(partner.interests ?? []).join(', ') || 'not specified'}
- Availability: ${(partner.availability ?? []).join(', ') || 'flexible'}

Respond ONLY with valid JSON in this exact shape:
{
  "explanation": "...",
  "sessionTopic": "..."
}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', temperature: 0.7, maxOutputTokens: 256 },
        });

        const raw = response.text?.trim() ?? '';
        let parsed: { explanation: string; sessionTopic: string };

        try {
            parsed = JSON.parse(raw);
        } catch {
            const explanationMatch = raw.match(/"explanation"\s*:\s*"([^"]+)"/);
            const topicMatch = raw.match(/"sessionTopic"\s*:\s*"([^"]+)"/);
            parsed = {
                explanation: explanationMatch?.[1] ?? 'You share complementary skills and compatible schedules that make you an excellent learning pair.',
                sessionTopic: topicMatch?.[1] ?? 'Introductory skill exchange session',
            };
        }

        const toCache: CachedInsight = { ...parsed, cachedAt: Date.now() };
        insightCache.set(cacheKey, toCache);
        res.json({ ...parsed, fromCache: false });
    } catch (err: unknown) {
        console.error('[server] Gemini match-insight error:', err);
        res.status(500).json({ error: 'Failed to generate match insight.' });
    }
});

// ----------------------------------------------------------------
// POST /api/session-plan
// Body: { sessionId, skillName, teacherName, learnerName, notes? }
// Response: LessonPlan & { fromCache: boolean }
// ----------------------------------------------------------------
app.post('/api/session-plan', async (req: Request, res: Response) => {
    const { sessionId, skillName, teacherName, learnerName, notes } = req.body ?? {};

    if (!sessionId || !skillName) {
        res.status(400).json({ error: 'sessionId and skillName are required.' });
        return;
    }

    const cached = planCache.get(sessionId);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
        const { cachedAt, ...plan } = cached;
        res.json({ ...plan, fromCache: true });
        return;
    }

    // Fallback when no API key is configured
    if (!ai) {
        const fallback: LessonPlan = {
            learningGoal: `By the end of this 60-minute session, ${learnerName ?? 'the learner'} will understand the core concepts of ${skillName} and be able to complete a basic hands-on exercise independently.`,
            steps: [
                { timeRange: '0–15 min', title: 'Concepts & Context', description: `Introduce the fundamentals of ${skillName}: key terminology, use-cases, and why it matters.` },
                { timeRange: '15–45 min', title: 'Live Walk-through', description: `${teacherName ?? 'The teacher'} demonstrates a working example while ${learnerName ?? 'the learner'} follows along and asks questions in real time.` },
                { timeRange: '45–60 min', title: 'Practice & Debrief', description: `${learnerName ?? 'The learner'} attempts the practice task independently; teacher reviews and gives feedback.` },
            ],
            practiceTask: `Build a small working example using the concepts from today's session on ${skillName} and share your screen so both partners can discuss the result.`,
            cachedAt: Date.now(),
        };
        planCache.set(sessionId, fallback);
        const { cachedAt: _ca, ...out } = fallback;
        res.json({ ...out, fromCache: false });
        return;
    }

    const prompt = `You are an expert peer-learning coach for SkillSwap, a campus skill-exchange platform.

Create a structured 60-minute lesson plan for the following 1-on-1 peer session:

- Skill being taught: ${skillName}
- Teacher: ${teacherName ?? 'the teacher'}
- Learner: ${learnerName ?? 'the learner'}
- Session notes / focus area: ${notes || 'None provided — choose a good beginner-friendly starting point'}

The plan must:
- Have ONE clear learning goal (2 sentences max)
- Have EXACTLY 3 timed steps that together total 60 minutes
- Have ONE concrete practice task the learner does during the last segment

Respond ONLY with valid JSON matching this exact shape (no extra keys, no markdown):
{
  "learningGoal": "string",
  "steps": [
    { "timeRange": "0–15 min",  "title": "string", "description": "string" },
    { "timeRange": "15–45 min", "title": "string", "description": "string" },
    { "timeRange": "45–60 min", "title": "string", "description": "string" }
  ],
  "practiceTask": "string"
}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', temperature: 0.75, maxOutputTokens: 512 },
        });

        const raw = response.text?.trim() ?? '';
        let parsed: Omit<LessonPlan, 'cachedAt'>;

        try {
            parsed = JSON.parse(raw);
        } catch {
            // Strip markdown fences if model wrapped output
            const fenceStripped = raw.replace(/```json?\n?/gi, '').replace(/```/g, '').trim();
            try {
                parsed = JSON.parse(fenceStripped);
            } catch {
                throw new Error('Model returned non-JSON response');
            }
        }

        // Validate shape before caching
        if (!parsed.learningGoal || !Array.isArray(parsed.steps) || parsed.steps.length < 3 || !parsed.practiceTask) {
            throw new Error('Unexpected response shape from model');
        }

        const toCache: LessonPlan = { ...parsed, steps: parsed.steps.slice(0, 3), cachedAt: Date.now() };
        planCache.set(sessionId, toCache);

        const { cachedAt: _ca, ...out } = toCache;
        res.json({ ...out, fromCache: false });
    } catch (err: unknown) {
        console.error('[server] Gemini session-plan error:', err);
        res.status(500).json({ error: 'Failed to generate session plan.' });
    }
});

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, insightCache: insightCache.size, planCache: planCache.size });
});

app.listen(PORT, () => {
    console.log(`[server] SkillSwap API running on http://localhost:${PORT}`);
});
