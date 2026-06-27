/* ============================================
   VIDYA AI — Student Quiz Engine
   ============================================ */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Timer, Zap, Award, MessageSquare, RefreshCw, AlertCircle, Target, BookOpen, Volume2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ProgressBar, ProgressRing } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { generateQuizQuestions, normalizeAnswer } from '../../lib/ai-engine';
import { CURRICULUM_DATA } from '../../data/curriculum-data';
import { speakText } from '../../lib/voice';
import { updateBKT, createDefaultBKT } from '../../lib/bkt';
import { computeWeaknessScore } from '../../lib/weakness';
import { generateId, xpToLevel } from '../../lib/utils';
import { db } from '../../lib/db';
import { useTranslation } from '../../lib/translations';
import type { QuizQuestion, QuizAttempt, BKTMastery, Subject, Chapter } from '../../types';
import './Quiz.css';

export const QuizPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { user, studentProfile, updateStudentProfile } = useAuthStore();
  const { t } = useTranslation();

  const { language } = useAppStore();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playbackControls, setPlaybackControls] = useState<any>(null);

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Timing and scores
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  // Results details
  const [xpEarned, setXpEarned] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [weaknessSummary, setWeaknessSummary] = useState<{ name: string; isWeak: boolean }[]>([]);
  const [ttsError, setTtsError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (playbackControls) {
        playbackControls.stop();
      }
    };
  }, [playbackControls, currentIdx, quizFinished]);

  const stripMarkdown = (text: string): string => {
    return text
      .replace(/[#*`~_]/g, '') // remove formatting characters
      .replace(/\$\$[\s\S]*?\$\$/g, '') // remove block math LaTeX
      .replace(/\$[\s\S]*?\$/g, '') // remove inline math LaTeX
      .replace(/<[^>]*>/g, '') // remove HTML tags
      .replace(/\|/g, ' ') // remove table pipes
      .replace(/[-+*]\s+\[[ x]\]/g, '') // remove checkboxes
      .replace(/\s+/g, ' ') // normalize whitespace
      .trim();
  };

  const handleSpeakText = async (text: string) => {
    if (isSpeaking) {
      if (playbackControls) {
        playbackControls.stop();
      }
      setIsSpeaking(false);
      setPlaybackControls(null);
    } else {
      try {
        const plainText = stripMarkdown(text);
        const controls = await speakText(
          plainText,
          () => setIsSpeaking(true),
          () => {
            setIsSpeaking(false);
            setPlaybackControls(null);
          },
          (err) => {
            console.error('[Quiz TTS Error]', err);
            setIsSpeaking(false);
            setPlaybackControls(null);
            setTtsError(err.message || 'Failed to synthesize speech.');
            setTimeout(() => setTtsError(null), 3000);
          }
        );
        setPlaybackControls(controls);
      } catch (err: any) {
        setTtsError(err.message || 'Failed to synthesize speech.');
        setTimeout(() => setTtsError(null), 3000);
      }
    }
  };

  // Load chapter and subject
  useEffect(() => {
    const fetchData = async () => {
      if (!chapterId) {
        setIsLoading(false);
        return;
      }
      try {
        const ch = await db.chapters.get(chapterId);
        if (ch) {
          setChapter(ch);
          const subj = await db.subjects.get(ch.subjectId);
          if (subj) {
            setSubject(subj);
          }
        }
      } catch (err) {
        console.error('Failed to load quiz metadata', err);
      }
    };
    fetchData();
  }, [chapterId]);

  // Load questions with adaptive filtering and deduplication
  useEffect(() => {
    if (!chapterId || !chapter || !studentProfile) {
      return;
    }

    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        const difficulty = studentProfile.difficultyLevel ?? 0.5;

        // 1. Check database pool
        let pool = await db.quizQuestions.where('chapterId').equals(chapterId).toArray();
        const isCustom = !CURRICULUM_DATA[chapterId];

        // Clean up any old dummy fallback questions or language mismatches from database
        const hasDummy = pool.some(q => q.questionText.includes('Choose the correct option') || q.questionText.includes('सही विकल्प का चयन करें'));
        // Check actual language mismatch: if user wants Hindi, questions should contain Hindi chars; if English, they should not
        const hasLangMismatch = pool.length > 0 && (() => {
          const sampleTexts = pool.slice(0, 5).map(q => q.questionText).join(' ');
          const hasHindiChars = /[\u0900-\u097F]/.test(sampleTexts);
          // If language is 'hi' but no Hindi chars, or language is 'en' but has Hindi chars
          return (language === 'hi' && !hasHindiChars) || (language === 'en' && hasHindiChars);
        })();
        if (hasDummy || hasLangMismatch) {
          console.log(`[Quiz] Invalidation triggered (lang=${language}, mismatch=${hasLangMismatch}, dummy=${hasDummy}). Clearing quiz questions for: ${chapterId}`);
          await db.quizQuestions.where('chapterId').equals(chapterId).delete();
          pool = [];
        }
        
        if (pool.length < 30) {
          console.log(`[Quiz] Question pool size (${pool.length}) is below 30. Preparing pool...`);
          let freshQuestions = generateQuizQuestions(chapterId, chapter.title, 35, difficulty, language, subject?.name);
          
          if ((freshQuestions.length === 0 || isCustom) && pool.length === 0) {
            // Fetch content generation from API for custom chapters
            try {
              const res = await fetch('/api/generate-chapter-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chapterId,
                  title: chapter.title,
                  description: chapter.description,
                  learningObjectives: chapter.learningObjectives,
                  board: subject?.board || 'CBSE',
                  grade: subject?.grade || 10,
                  subject: subject?.name || 'Mathematics',
                  lang: language
                })
              });
              if (res.ok) {
                const data = await res.json();
                if (data.quizQuestions && data.quizQuestions.length > 0) {
                  freshQuestions = data.quizQuestions.map((q: any, idx: number) => ({
                    ...q,
                    id: `${chapterId}_q_${idx}`,
                    chapterId,
                    tags: q.tags || [chapterId]
                  }));
                  // Save flashcards and notes too
                  if (data.flashcards) {
                    const mappedFcs = data.flashcards.map((fc: any, idx: number) => ({
                      id: `${chapterId}_fc_${idx}`,
                      chapterId,
                      front: fc.front,
                      back: fc.back,
                      difficulty: fc.difficulty || 0.3
                    }));
                    await db.flashcards.bulkPut(mappedFcs);
                  }
                  if (data.overview) {
                    await db.notes.put({
                      id: `${chapterId}_notes`,
                      chapterId,
                      content: `# ${chapter.title}\n\n${data.overview}\n\n## Theory\n${data.theorySections.map((s: any) => `### ${s.title}\n\n${s.content}`).join('\n\n')}`,
                      generatedBy: 'ai',
                      version: 1,
                      createdAt: Date.now()
                    });
                  }
                }
              }
            } catch (apiErr) {
              console.error('Failed to generate custom quiz questions via API', apiErr);
            }
          }

          if (freshQuestions.length > 0) {
            const formattedPool = freshQuestions.map((q, idx) => ({
              ...q,
              id: q.id || `${chapterId}_q_${idx}`,
              chapterId
            }));
            await db.quizQuestions.bulkPut(formattedPool);
            pool = await db.quizQuestions.where('chapterId').equals(chapterId).toArray();
          }
        }

        // 2. Fetch attempts in the last 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const attempts = await db.quizAttempts
          .where('userId')
          .equals(studentProfile.userId)
          .and(att => att.chapterId === chapterId && att.startedAt >= thirtyDaysAgo)
          .toArray();

        // 3. Extract IDs of answered questions
        const answeredIds = new Set<string>();
        attempts.forEach(att => {
          if (att.questions) {
            att.questions.forEach(id => answeredIds.add(id));
          }
        });

        // Deduplicate pool by question text to prevent repeated questions
        const seenTexts = new Set<string>();
        const uniquePool: QuizQuestion[] = [];
        pool.forEach(q => {
          const normText = q.questionText.toLowerCase().trim().replace(/\s+/g, ' ');
          if (!seenTexts.has(normText)) {
            seenTexts.add(normText);
            uniquePool.push(q);
          }
        });

        // 4. Filter out answered questions
        let available = uniquePool.filter(q => !answeredIds.has(q.id));

        // 5. Fallback: if available count < 10, reset filter and use full pool
        if (available.length < 10) {
          console.log('[Quiz] Low unanswered questions count. Re-using full unique question pool.');
          available = uniquePool;
        }

        // 6. Filter by student difficulty proximity and shuffle for personalization
        let selectedPool = available.filter(q => Math.abs((q.difficulty ?? 0.5) - difficulty) <= 0.25);
        if (selectedPool.length < 10) {
          selectedPool = available;
        }

        const shuffledPool = [...selectedPool].sort(() => Math.random() - 0.5);

        // 7. Select top 10 questions and shuffle their options if MCQ
        const selected = shuffledPool.slice(0, 10).map(q => {
          if (q.questionType === 'mcq' && q.options) {
            const shuffled = [...q.options];
            shuffled.sort(() => Math.random() - 0.5);
            // Ensure correct answer is in options
            if (!shuffled.includes(q.correctAnswer)) {
              shuffled[0] = q.correctAnswer;
              shuffled.sort(() => Math.random() - 0.5);
            }
            return { ...q, options: shuffled };
          }
          return q;
        });

        setQuestions(selected);
      } catch (err) {
        console.error('Failed to load or deduplicate quiz questions', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [chapterId, chapter, studentProfile, language, subject]);

  // Start timer on quiz start
  useEffect(() => {
    if (quizStarted && !quizFinished) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizStarted, quizFinished]);

  if (isLoading) {
    return (
      <div className="quiz-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <RefreshCw className="animate-spin" size={40} color="var(--color-primary)" />
        <p style={{ marginTop: 'var(--sp-4)', color: 'var(--color-text-secondary)' }}>Loading adaptive quiz...</p>
      </div>
    );
  }

  if (!chapter || !subject) {
    return (
      <div className="quiz-page" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--color-error)" />
        <h2 style={{ marginTop: 'var(--sp-4)', fontWeight: 800 }}>Chapter Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-6)' }}>We couldn't load this study quiz.</p>
        <Button variant="primary" onClick={() => navigate('/student/subjects')}>Back to Subjects</Button>
      </div>
    );
  }

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleSelectOption = (option: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIdx]: option
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQuizFinished(true);

    const timeTaken = secondsElapsed;
    const totalQuestions = questions.length;
    let correctCount = 0;
    const answersList: string[] = [];

    questions.forEach((q, idx) => {
      const selectedIndexStr = selectedAnswers[idx];
      let ansVal = '';
      if (selectedIndexStr !== undefined) {
        if (q.questionType === 'mcq' && q.options) {
          ansVal = q.options[Number(selectedIndexStr)] || '';
        } else if (q.questionType === 'true_false') {
          ansVal = Number(selectedIndexStr) === 0 ? 'true' : 'false';
        } else {
          // Fill blank or short answer
          ansVal = selectedIndexStr;
        }
      }
      answersList.push(ansVal);
      if (normalizeAnswer(ansVal) === normalizeAnswer(q.correctAnswer)) {
        correctCount++;
      }
    });

    const scorePct = correctCount / totalQuestions;
    setFinalScore(scorePct);

    // Calculate XP
    const baseXP = correctCount * 20; // 20 XP per correct answer
    const perfectBonus = correctCount === totalQuestions ? 50 : 0; // 50 XP perfect score bonus
    const speedBonus = timeTaken < chapter.estimatedTimeMin * 60 * 0.75 ? 10 : 0; // Speed bonus
    const totalXP = baseXP + perfectBonus + speedBonus;
    setXpEarned(totalXP);

    if (!user || !studentProfile) return;

    // Save quiz attempt
    const attempt: QuizAttempt = {
      id: generateId(),
      userId: user.id,
      chapterId: chapter.id,
      questions: questions.map(q => q.id),
      answers: answersList,
      score: scorePct,
      timeTakenSec: timeTaken,
      startedAt: startTimeRef.current,
      completedAt: Date.now(),
      synced: false
    };

    try {
      await db.quizAttempts.add(attempt);

      // Process BKT updates for skill tags
      const skillUpdatedMastery: Record<string, BKTMastery> = {};

      for (let idx = 0; idx < questions.length; idx++) {
        const q = questions[idx];
        const isCorrect = answersList[idx] ? normalizeAnswer(answersList[idx]) === normalizeAnswer(q.correctAnswer) : false;

        // Each question has tags which denote skills (or default to chapter id if empty)
        const skills = (q.tags && q.tags.length > 0) ? q.tags : [chapter.id];

        for (const skillId of skills) {
          // Find existing BKT record
          let bktRecord = await db.bktMastery
            .where('[userId+chapterId+skillId]')
            .equals([user.id, chapter.id, skillId])
            .first();

          if (!bktRecord) {
            const temp = createDefaultBKT(user.id, chapter.id, skillId);
            bktRecord = {
              ...temp,
              id: generateId()
            } as BKTMastery;
          }

          // Update BKT parameters
          const updated = updateBKT(
            {
              pKnow: bktRecord.pKnow,
              pTransit: bktRecord.pTransit,
              pSlip: bktRecord.pSlip,
              pGuess: bktRecord.pGuess
            },
            isCorrect
          );

          bktRecord.pKnow = updated.pKnow;
          bktRecord.attempts += 1;
          bktRecord.lastUpdated = Date.now();

          await db.bktMastery.put(bktRecord);
          skillUpdatedMastery[skillId] = bktRecord;
        }
      }

      // Compute & save weakness score
      const allAttempts = await db.quizAttempts
        .where('chapterId')
        .equals(chapter.id)
        .and(a => a.userId === user.id)
        .toArray();

      // Retrieve first/main skill BKT record for overall chapter weakness
      const mainSkillId = questions[0]?.tags?.[0] || chapter.id;
      const mainBkt = skillUpdatedMastery[mainSkillId] || await db.bktMastery
        .where('[userId+chapterId+skillId]')
        .equals([user.id, chapter.id, mainSkillId])
        .first();

      const weaknessInfo = computeWeaknessScore({
        quizAttempts: allAttempts,
        bktMastery: mainBkt,
        expectedTimeSec: chapter.estimatedTimeMin * 60
      });

      let weaknessRecord = await db.weaknessScores
        .where('[userId+chapterId]')
        .equals([user.id, chapter.id])
        .first();

      if (!weaknessRecord) {
        weaknessRecord = {
          id: generateId(),
          userId: user.id,
          subjectId: chapter.subjectId,
          chapterId: chapter.id,
          weaknessScore: weaknessInfo.score,
          confidence: weaknessInfo.confidence,
          evidenceCount: allAttempts.length,
          lastComputed: Date.now()
        };
      } else {
        weaknessRecord.weaknessScore = weaknessInfo.score;
        weaknessRecord.confidence = weaknessInfo.confidence;
        weaknessRecord.evidenceCount = allAttempts.length;
        weaknessRecord.lastComputed = Date.now();
      }

      await db.weaknessScores.put(weaknessRecord);

      // Compute skill accuracy from the current quiz answers
      const skillPerf: Record<string, { correct: number; total: number }> = {};
      for (let idx = 0; idx < questions.length; idx++) {
        const q = questions[idx];
        const isCorrect = answersList[idx] ? normalizeAnswer(answersList[idx]) === normalizeAnswer(q.correctAnswer) : false;
        
        // Each question has tags which denote skills (or default to chapter id if empty)
        const skills = (q.tags && q.tags.length > 0) ? q.tags : [chapter.id];
        
        for (const skillId of skills) {
          if (!skillPerf[skillId]) {
            skillPerf[skillId] = { correct: 0, total: 0 };
          }
          skillPerf[skillId].total += 1;
          if (isCorrect) {
            skillPerf[skillId].correct += 1;
          }
        }
      }

      // Prepare UI weakness summary based on current quiz performance
      const summaryList = Object.keys(skillPerf).map(skill => {
        const perf = skillPerf[skill];
        const accuracy = perf.correct / perf.total;
        return {
          name: skill.charAt(0).toUpperCase() + skill.slice(1).replace(/-/g, ' '),
          isWeak: accuracy < 0.8 // If accuracy is less than 80%, mark as weak
        };
      });
      setWeaknessSummary(summaryList);

      // Update Student Profile (XP, levels) in Zustand store + IndexedDB
      const currentXP = studentProfile.xpTotal + totalXP;
      // Use xpToLevel utility for consistent level calculation
      const { level: newLevel } = xpToLevel(currentXP);

      // Streak update using midnight-based comparison to avoid DST issues
      let currentStreak = studentProfile.streakCurrent;
      const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD UTC
      const lastStudyStr = studentProfile.lastStudyDate;
      if (lastStudyStr !== todayStr) {
        // Check if last study was yesterday (86400000ms = 1 day, but compare date-strings)
        const yesterday = new Date();
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        currentStreak = lastStudyStr === yesterdayStr ? currentStreak + 1 : 1;
      }

      const updatedProfile = {
        ...studentProfile,
        xpTotal: currentXP,
        level: newLevel,
        streakCurrent: currentStreak,
        streakBest: Math.max(studentProfile.streakBest || 0, currentStreak),
        lastStudyDate: new Date().toISOString().split('T')[0],
        // Adapt difficulty level slightly
        difficultyLevel: Math.max(0.1, Math.min(0.9, studentProfile.difficultyLevel + (scorePct > 0.8 ? 0.05 : scorePct < 0.5 ? -0.05 : 0)))
      };

      updateStudentProfile(updatedProfile);

      // Save user/profile in Dexie too
      await db.studentProfiles.put(updatedProfile);

    } catch (err) {
      console.error('Error saving quiz result to IndexedDB', err);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // 1. Splash Screen
  if (!quizStarted) {
    return (
      <div className="quiz-page">
        <div className="quiz-header">
          <button className="quiz-header__back" onClick={() => navigate(subject ? `/student/subjects/${subject.id}` : '/student/subjects')}>
            <ArrowLeft size={18} /> Exit
          </button>
        </div>

        <Card className="results-card" style={{ padding: 'var(--sp-10)' }}>
          <div style={{ marginBottom: 'var(--sp-4)', display: 'flex', justifyContent: 'center' }}>
            <Target size={48} color="var(--color-primary)" />
          </div>
          <h1 className="results-card__title">{chapter.title} Quiz</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-6)', fontSize: 'var(--fs-body)' }}>
            This adaptive quiz is custom generated based on your mastery of {chapter.title}.
          </p>

          <div style={{ display: 'flex', gap: 'var(--sp-6)', justifyContent: 'center', marginBottom: 'var(--sp-8)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 'var(--fs-h4)' }}>{questions.length}</div>
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-bold)' }}>QUESTIONS</div>
            </div>
            <div style={{ width: '1px', background: 'var(--color-border)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 'var(--fs-h4)' }}>Adaptive</div>
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-bold)' }}>DIFFICULTY</div>
            </div>
            <div style={{ width: '1px', background: 'var(--color-border)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 'var(--fs-h4)' }}>+{questions.length * 20} XP</div>
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-bold)' }}>POTENTIAL XP</div>
            </div>
          </div>

          <Button variant="primary" size="lg" onClick={handleStartQuiz} style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}>
            Start Quiz
          </Button>
        </Card>
      </div>
    );
  }

  // 2. Results Screen
  if (quizFinished) {
    const isSuccess = finalScore >= 0.6;
    return (
      <div className="quiz-page">
        <div className="quiz-header">
          <h2>Quiz Completed!</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate(subject ? `/student/subjects/${subject.id}` : '/student/subjects')}>
            Close
          </Button>
        </div>

        <Card className="results-card">
          <div style={{ marginBottom: 'var(--sp-3)', display: 'flex', justifyContent: 'center' }}>
            {isSuccess ? <Award size={48} color="var(--color-success)" /> : <BookOpen size={48} color="var(--color-warning)" />}
          </div>
          <h1 className="results-card__title">
            {isSuccess ? 'Excellent Job!' : 'Keep Practicing!'}
          </h1>

          <div className="results-card__score-ring">
            <ProgressRing
              value={finalScore * 100}
              size={120}
              strokeWidth={10}
              color={isSuccess ? 'var(--color-success)' : 'var(--color-warning)'}
            >
              <div className="results-card__score-text" style={{ position: 'static', transform: 'none' }}>
                <span className="results-card__score-pct">{Math.round(finalScore * 100)}%</span>
                <span className="results-card__score-label">Score</span>
              </div>
            </ProgressRing>
          </div>

          <div className="results-card__stats">
            <div className="results-card__stat">
              <div className="results-card__stat-val" style={{ color: 'var(--color-primary)' }}>
                <Zap size={16} fill="var(--color-primary)" /> +{xpEarned}
              </div>
              <div className="results-card__stat-lbl">XP Earned</div>
            </div>
            <div className="results-card__stat">
              <div className="results-card__stat-val">
                <Timer size={16} /> {formatTime(secondsElapsed)}
              </div>
              <div className="results-card__stat-lbl">{t('timeTaken')}</div>
            </div>
            <div className="results-card__stat">
              <div className="results-card__stat-val">
                {Math.round(finalScore * questions.length)} / {questions.length}
              </div>
              <div className="results-card__stat-lbl">{t('correct')}</div>
            </div>
          </div>

          {weaknessSummary.length > 0 && (
            <div className="results-weakness">
              <h3>{t('conceptMastery')}</h3>
              <div className="results-weakness__list">
                {weaknessSummary.map((item, i) => (
                  <div key={i} className="results-weakness__item">
                    <span className="results-weakness__name">{item.name}</span>
                    <span className={`results-weakness__status results-weakness__status--${item.isWeak ? 'weak' : 'strong'}`}>
                      {item.isWeak ? t('needsPractice') : t('mastered')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="results-card__buttons">
            <Button variant="primary" onClick={() => navigate(subject ? `/student/subjects/${subject.id}` : '/student/subjects')}>
              {t('backToChapter')}
            </Button>
            <Button variant="secondary" icon={MessageSquare} onClick={() => navigate('/student/tutor')}>
              {t('askAiTutor')}
            </Button>
          </div>
        </Card>

        {/* Detailed Question Review */}
        <div className="results-review">
          <h3>{t('questionReview')}</h3>
          {questions.map((q, idx) => {
            const selectedIndexStr = selectedAnswers[idx];
            let ans = 'No answer';
            if (selectedIndexStr !== undefined) {
              if (q.questionType === 'mcq' && q.options) {
                ans = q.options[Number(selectedIndexStr)] || '';
              } else if (q.questionType === 'true_false') {
                ans = Number(selectedIndexStr) === 0 ? 'true' : 'false';
              } else {
                ans = selectedIndexStr;
              }
            }
            const isCorrect = normalizeAnswer(ans) === normalizeAnswer(q.correctAnswer);

            return (
              <div
                key={q.id}
                className={`results-review__item ${isCorrect ? 'results-review__item--correct' : 'results-review__item--incorrect'}`}
              >
                <div className="results-review__q-text">
                  Q{idx + 1}: {q.questionText}
                </div>
                <div className="results-review__ans-row">
                  <div>{t('yourAnswer')}: <strong>{ans}</strong> {isCorrect ? '✓' : '✗'}</div>
                  {!isCorrect && (
                    <div>{t('correctAnswer')}: <strong>{q.correctAnswer}</strong></div>
                  )}
                </div>
                {q.explanation && (
                  <div className="results-review__exp" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-2)' }}>
                    <div style={{ flex: 1 }}>
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSpeakText(q.explanation)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isSpeaking ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        padding: 'var(--sp-1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        flexShrink: 0
                      }}
                      title="Read explanation aloud"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Question Interface
  const currentQuestion = questions[currentIdx];
  const progressPct = ((currentIdx) / questions.length) * 100;
  const isMcq = currentQuestion?.questionType === 'mcq' || currentQuestion?.questionType === 'true_false';

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <button className="quiz-header__back" onClick={() => navigate(subject ? `/student/subjects/${subject.id}` : '/student/subjects')}>
          <ArrowLeft size={18} /> Exit Quiz
        </button>
        <div className="quiz-header__timer">
          <Timer size={16} />
          <span>{formatTime(secondsElapsed)}</span>
        </div>
      </div>
      {ttsError && (
        <div className="toast-notification toast-notification--error" role="alert" style={{ margin: '0 var(--sp-4) var(--sp-2)', borderRadius: 'var(--radius-md)', padding: 'var(--sp-2) var(--sp-3)', background: 'var(--color-error)', color: '#fff', fontSize: 'var(--fs-caption)' }}>
          🔇 {ttsError}
        </div>
      )}

      <div className="quiz-progress">
        <div className="quiz-progress__meta">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{Math.round(progressPct)}% Complete</span>
        </div>
        <ProgressBar value={progressPct} size="sm" variant="gradient" />
      </div>

      {currentQuestion && (
        <Card className="quiz-card">
          <div className="quiz-question__tags">
            {(currentQuestion.tags || []).map((t, idx) => (
              <span key={idx} className="quiz-question__tag">{t}</span>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
            <h2 className="quiz-question__text" style={{ flex: 1, margin: 0 }}>
              {currentQuestion.questionText}
            </h2>
            <button
              type="button"
              onClick={() => handleSpeakText(currentQuestion.questionText)}
              style={{
                background: 'none',
                border: 'none',
                color: isSpeaking ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                padding: 'var(--sp-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                flexShrink: 0
              }}
              title="Read question aloud"
            >
              <Volume2 size={20} />
            </button>
          </div>

          <div className="quiz-options">
            {isMcq && (currentQuestion.options || currentQuestion.questionType === 'true_false') ? (
              (currentQuestion.options || ['true', 'false']).map((option, idx) => {
                const labelPrefix = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedAnswers[currentIdx] === String(idx);

                return (
                  <button
                    key={`${currentQuestion.id}_opt_${idx}`}
                    type="button"
                    className={`quiz-option ${isSelected ? 'quiz-option--selected' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelectOption(String(idx));
                    }}
                  >
                    <span className="quiz-option__prefix">{labelPrefix}</span>
                    <span>{option}</span>
                  </button>
                );
              })
            ) : (
              /* Fill blank / short answer input */
              <div style={{ width: '100%' }}>
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  style={{
                    width: '100%',
                    padding: 'var(--sp-4)',
                    fontSize: 'var(--fs-body)',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--color-border)',
                    outline: 'none',
                    background: 'var(--color-surface-card)',
                    color: 'var(--color-text-primary)'
                  }}
                  value={selectedAnswers[currentIdx] || ''}
                  onChange={(e) => handleSelectOption(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="quiz-actions">
            <Button
              variant="primary"
              size="md"
              disabled={selectedAnswers[currentIdx] === undefined || selectedAnswers[currentIdx] === ''}
              onClick={handleNext}
              icon={currentIdx < questions.length - 1 ? undefined : Award}
            >
              {currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
