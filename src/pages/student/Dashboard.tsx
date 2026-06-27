/* ============================================
   VIDYA AI — Student Dashboard (Dynamic & Adaptive)
   ============================================ */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Zap, Star, BookOpen, MessageSquare, Trophy, ChevronRight, Sparkles, Brain, Target } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { getGreeting } from '../../lib/utils';
// Seed data imports removed - querying db directly
import { db } from '../../lib/db';
import { GyaniMascot } from '../../components/mascot/GyaniMascot';
import { AvatarIcon } from '../../components/ui/AvatarIcon';
import { useTranslation } from '../../lib/translations';
import './StudentDashboard.css';

interface SubjectProgressDetail {
  id: string;
  name: string;
  color: string;
  icon: string;
  totalChapters: number;
  completedChapters: number;
  mastery: number;
  weakChapters: string[];
}

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, studentProfile } = useAuthStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [subjectsProgress, setSubjectsProgress] = useState<SubjectProgressDetail[]>([]);
  const [recentChapter, setRecentChapter] = useState<{ id: string; subjectId: string; title: string } | null>(null);
  const [recentProgress, setRecentProgress] = useState(0);

  const name = user?.name || 'Student';
  const streak = studentProfile?.streakCurrent ?? 0;
  const xp = studentProfile?.xpTotal ?? 0;
  const level = studentProfile?.level ?? 1;
  const grade = studentProfile?.grade ?? 10;
  const board = studentProfile?.board ?? 'CBSE';

  const isChildMode = grade <= 5;

  useEffect(() => {
    const fetchProgress = async () => {
      if (!studentProfile) {
        setLoading(false);
        return;
      }
      setLoading(true);

      // Pre-seed demo data in database if student-aarav-001 has no attempts
      if (studentProfile.userId === 'student-aarav-001') {
        const attemptsCount = await db.quizAttempts.where('userId').equals('student-aarav-001').count();
        if (attemptsCount === 0) {
          // Add some demo quiz attempts to make analytics live
          await db.quizAttempts.bulkAdd([
            {
              id: 'demo-att-1',
              userId: 'student-aarav-001',
              chapterId: 'cbse-10-math-ch1',
              questions: ['q1', 'q2', 'q3', 'q4', 'q5'],
              answers: ['correct', 'correct', 'correct', 'incorrect', 'correct'],
              score: 0.8,
              timeTakenSec: 240,
              startedAt: Date.now() - 4 * 86400000,
              synced: true,
            },
            {
              id: 'demo-att-2',
              userId: 'student-aarav-001',
              chapterId: 'cbse-10-math-ch2',
              questions: ['q6', 'q7', 'q8', 'q9', 'q10'],
              answers: ['correct', 'correct', 'correct', 'correct', 'correct'],
              score: 1.0,
              timeTakenSec: 180,
              startedAt: Date.now() - 2 * 86400000,
              synced: true,
            },
            {
              id: 'demo-att-3',
              userId: 'student-aarav-001',
              chapterId: 'cbse-10-science-ch1',
              questions: ['q11', 'q12'],
              answers: ['correct', 'incorrect'],
              score: 0.5,
              timeTakenSec: 120,
              startedAt: Date.now() - 1 * 86400000,
              synced: true,
            },
          ]);

          // Seed BKT mastery records
          await db.bktMastery.bulkAdd([
            { id: 'bkt-1', userId: 'student-aarav-001', chapterId: 'cbse-10-math-ch1', skillId: 'real-numbers', pKnow: 0.96, pTransit: 0.1, pSlip: 0.1, pGuess: 0.25, attempts: 5, lastUpdated: Date.now() },
            { id: 'bkt-2', userId: 'student-aarav-001', chapterId: 'cbse-10-math-ch2', skillId: 'polynomials', pKnow: 0.98, pTransit: 0.1, pSlip: 0.1, pGuess: 0.25, attempts: 5, lastUpdated: Date.now() },
            { id: 'bkt-3', userId: 'student-aarav-001', chapterId: 'cbse-10-science-ch1', skillId: 'chemical-rx', pKnow: 0.65, pTransit: 0.1, pSlip: 0.1, pGuess: 0.25, attempts: 2, lastUpdated: Date.now() },
          ]);

          // Seed weakness score
          await db.weaknessScores.add({
            id: 'weak-1',
            userId: 'student-aarav-001',
            subjectId: 'cbse-10-science',
            chapterId: 'cbse-10-science-ch1',
            weaknessScore: 0.78,
            confidence: 0.8,
            evidenceCount: 2,
            lastComputed: Date.now(),
          });
        }
      }

      // 1. Fetch subjects matching current student's board and grade from Dexie DB
      const dbSubjects = await db.subjects.where('board').equals(board).toArray();
      const currentSubjects = Array.from(
        new Map(
          dbSubjects
            .filter(s => Number(s.grade) === Number(grade))
            .map(s => [s.id, s])
        ).values()
      ).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      const progressList: SubjectProgressDetail[] = [];

      for (const subj of currentSubjects) {
        // Fetch chapters in this subject from DB
        const subjChapters = await db.chapters.where('subjectId').equals(subj.id).toArray();
        subjChapters.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        
        let completed = 0;
        let sumMastery = 0;
        const weakChs: string[] = [];

        for (const ch of subjChapters) {
          // Check quiz attempts for this chapter
          const attempts = await db.quizAttempts
            .where('userId').equals(studentProfile.userId)
            .and(att => att.chapterId === ch.id)
            .toArray();

          const maxScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
          if (maxScore >= 0.8) {
            completed++;
          }
          const bktRecords = await db.bktMastery
            .where('userId')
            .equals(studentProfile.userId)
            .and(b => b.chapterId === ch.id)
            .toArray();

          let chMastery = maxScore;
          if (bktRecords.length > 0) {
            const sumKnow = bktRecords.reduce((sum, r) => sum + r.pKnow, 0);
            chMastery = sumKnow / bktRecords.length;
          }
          sumMastery += chMastery;

          // Check if it represents a weakness
          const isWeak = chMastery > 0 && chMastery < 0.75;
          if (isWeak) {
            weakChs.push(ch.id);
          }
        }

        const avgMastery = subjChapters.length > 0 ? sumMastery / subjChapters.length : 0;

        progressList.push({
          id: subj.id,
          name: subj.name,
          color: subj.color,
          icon: subj.icon,
          totalChapters: subjChapters.length,
          completedChapters: completed,
          mastery: avgMastery,
          weakChapters: weakChs,
        });
      }

      setSubjectsProgress(progressList);

      // Fetch last accessed/recent study session or quiz attempt
      const lastAttempt = await db.quizAttempts
        .where('userId')
        .equals(studentProfile.userId)
        .reverse()
        .sortBy('startedAt');

      if (lastAttempt && lastAttempt.length > 0) {
        const recentCh = await db.chapters.get(lastAttempt[0].chapterId);
        if (recentCh) {
          setRecentChapter({
            id: recentCh.id,
            subjectId: recentCh.subjectId,
            title: recentCh.title,
          });
          setRecentProgress(lastAttempt[0].score);
        }
      }

      setLoading(false);
    };

    fetchProgress();
  }, [studentProfile, grade, board]);

  if (loading) {
    return (
      <div className="sdash-loading">
        <Sparkles className="animate-spin text-primary" size={32} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  // Brand New Student Account Welcoming Screen (Welcome State)
  // XP = 0 indicates fresh account
  const isFreshAccount = xp === 0;

  if (isFreshAccount) {
    return (
      <div className="sdash sdash--fresh">
        <div className="sdash__fresh-hero">
          <GyaniMascot state="welcome" size="lg" bubbleText={`Welcome, ${name}! Let's start your learning journey today. Choose your first subject below to begin.`} />
        </div>

        <section className="sdash__section">
          <div className="sdash__section-header sdash__section-header--center">
            <h2>Choose Your First Subject</h2>
            <p>Select a subject to unlock your lessons, flashcards, and quizzes</p>
          </div>
          <div className="sdash__subjects-grid">
            {subjectsProgress.map((subj) => (
              <Card
                key={subj.id}
                variant="interactive"
                padding="md"
                className="sdash__subject-card sdash__subject-card--fresh"
                onClick={() => navigate(`/student/subjects/${subj.id}`)}
              >
                <div className="sdash__subject-top" style={{ background: `${subj.color}12`, color: subj.color }}>
                  <AvatarIcon id={subj.icon} size={28} />
                </div>
                <div className="sdash__subject-info">
                  <h4>{subj.name}</h4>
                  <p>{subj.totalChapters} standard chapters</p>
                  <Button variant="secondary" size="sm" className="sdash__subject-start-btn">
                    Start Learning <ChevronRight size={14} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const weakSubjects = subjectsProgress.filter(s => s.mastery > 0 && s.mastery < 0.75);

  return (
    <div className="sdash">
      {/* Header */}
      <div className="sdash__header">
        <div className="sdash__greeting">
          <h1 className="sdash__greeting-text">
            {t(getGreeting())},<br />
            <span className="sdash__name">{name}!</span>
          </h1>
          <p className="sdash__greeting-sub">
            {weakSubjects.length > 0
              ? `${t('letsWorkOn')} ${t(weakSubjects[0].name)} ${t('today')}`
              : t('amazingReady')}
          </p>
        </div>

        <div className="sdash__stats-row">
          <div className="sdash__stat sdash__stat--streak">
            <Flame size={18} color="#FF6B6B" />
            <div>
              <span className="sdash__stat-value">{streak}</span>
              <span className="sdash__stat-label">{t('streak')}</span>
            </div>
          </div>
          <div className="sdash__stat sdash__stat--xp">
            <Zap size={18} color="#F7DC6F" />
            <div>
              <span className="sdash__stat-value">{xp.toLocaleString()}</span>
              <span className="sdash__stat-label">{t('totalXp')}</span>
            </div>
          </div>
          <div className="sdash__stat sdash__stat--level">
            <Star size={18} color="#BB8FCE" />
            <div>
              <span className="sdash__stat-value">{level}</span>
              <span className="sdash__stat-label">{t('level')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Age-based Visual Layouts */}
      {isChildMode ? (
        /* ================= CHILD MODE (Grades 1-5) ================= */
        <div className="sdash__child-mode animate-fade-in-up">
          <div className="sdash__child-mascot-row">
            <GyaniMascot state="welcome" size="md" bubblePosition="right" bubbleText="You are leveling up fast! Keep completing chapters to unlock achievements!" />
          </div>

          <section className="sdash__section">
            <div className="sdash__section-header">
              <h2>{t('adventureMap')}</h2>
            </div>
            <div className="child-pathway">
              {subjectsProgress.map((subj, idx) => (
                <div key={subj.id} className="child-pathway__node-wrap">
                  <button
                    className="child-pathway__node"
                    style={{ background: subj.color, boxShadow: `0 8px 16px ${subj.color}40` }}
                    onClick={() => navigate(`/student/subjects/${subj.id}`)}
                    title={t(subj.name)}
                  >
                    <AvatarIcon id={subj.icon} size={28} color="#FFFFFF" />
                  </button>
                  <span className="child-pathway__label">{t(subj.name)}</span>
                  {idx < subjectsProgress.length - 1 && (
                    <div className="child-pathway__connector" style={{ background: `linear-gradient(90deg, ${subj.color}, ${subjectsProgress[idx+1].color})` }} />
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* ================= ACADEMIC MODE (Grades 6-10) ================= */
        <div className="sdash__academic-mode animate-fade-in-up">
          {/* Continue Learning - Show last accessed or default first math chapter */}
          <section className="sdash__section">
            <div className="sdash__section-header">
              <h2>{t('continueLearning')}</h2>
            </div>
            <Card
              variant="interactive"
              className="sdash__continue-card"
              onClick={() =>
                recentChapter
                  ? navigate(`/student/subjects/${recentChapter.subjectId}/chapters/${recentChapter.id}`)
                  : navigate(`/student/subjects/cbse-10-math/chapters/cbse-10-math-ch1`)
              }
            >
              <div className="sdash__continue-info">
                <div className="sdash__continue-icon" style={{ background: 'rgba(255, 107, 107, 0.12)', color: '#FF6B6B' }}>
                  <BookOpen size={20} />
                </div>
                <div className="sdash__continue-text">
                  <h3>{recentChapter ? t(recentChapter.title) : t('Mathematics')}</h3>
                  <p>{recentChapter ? t('resumeLesson') : t('Real Numbers')}</p>
                </div>
              </div>
              <div className="sdash__continue-progress">
                <ProgressBar value={recentChapter ? recentProgress * 100 : 0} variant="gradient" size="sm" />
                <span className="sdash__continue-pct">{recentChapter ? Math.round(recentProgress * 100) : 0}%</span>
              </div>
              <Button variant="primary" size="sm">{t('continue')}</Button>
            </Card>
          </section>

          {/* Your Subjects */}
          <section className="sdash__section">
            <div className="sdash__section-header">
              <h2>{t('yourSubjects')}</h2>
              <button className="sdash__see-all" onClick={() => navigate('/student/subjects')}>
                {t('viewAll')} <ChevronRight size={14} />
              </button>
            </div>
            <div className="sdash__subjects-grid">
              {subjectsProgress.map((subject) => (
                <Card
                  key={subject.id}
                  variant="interactive"
                  padding="sm"
                  className="sdash__subject-card"
                  onClick={() => navigate(`/student/subjects/${subject.id}`)}
                >
                  <div className="sdash__subject-top" style={{ background: `${subject.color}12`, color: subject.color }}>
                    <AvatarIcon id={subject.icon} size={22} />
                  </div>
                  <div className="sdash__subject-info">
                    <h4>{t(subject.name)}</h4>
                    <div className="sdash__subject-progress-wrap">
                      <ProgressBar value={subject.mastery * 100} size="sm" color={subject.color} animated={false} />
                      <span className="sdash__subject-pct">{Math.round(subject.mastery * 100)}%</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* AI Tutor doubt room insights */}
          {weakSubjects.length > 0 && (
            <section className="sdash__section">
              <div className="sdash__section-header">
                <h2>{t('recommended')}</h2>
                <Sparkles size={16} color="var(--color-primary)" />
              </div>
              <div className="sdash__recs">
                <Card
                  variant="glass"
                  className="sdash__rec-card"
                  onClick={() => navigate(`/student/subjects/${weakSubjects[0].id}`)}
                >
                  <div className="sdash__rec-icon" style={{ background: 'rgba(200, 0, 24, 0.1)', color: 'var(--color-primary)' }}>
                    <Target size={18} />
                  </div>
                  <div className="sdash__rec-text">
                    <h4>{t('reviseWeak')}</h4>
                    <p>{t(weakSubjects[0].name)} - {t('needsPractice')}</p>
                  </div>
                  <ChevronRight size={16} className="sdash__rec-arrow" />
                </Card>
                <Card variant="glass" className="sdash__rec-card" onClick={() => navigate('/student/tutor')}>
                  <div className="sdash__rec-icon" style={{ background: 'rgba(78, 205, 196, 0.1)', color: '#4ECDC4' }}>
                    <Brain size={18} />
                  </div>
                  <div className="sdash__rec-text">
                    <h4>{t('aiTutor')}</h4>
                    <p>{t('askGyani')}</p>
                  </div>
                  <ChevronRight size={16} className="sdash__rec-arrow" />
                </Card>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Quick Access Portals */}
      <section className="sdash__section">
        <div className="sdash__quick-actions">
          <button className="sdash__quick-action" onClick={() => navigate('/student/tutor')}>
            <MessageSquare size={20} />
            <span>{t('aiTutor')}</span>
          </button>
          <button className="sdash__quick-action" onClick={() => navigate('/student/achievements')}>
            <Trophy size={20} />
            <span>{t('achievements')}</span>
          </button>
          <button className="sdash__quick-action" onClick={() => navigate('/student/doubts')}>
            <Brain size={20} />
            <span>{t('doubtRoom')}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
