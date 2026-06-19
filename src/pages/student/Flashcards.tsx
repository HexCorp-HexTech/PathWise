/* ============================================
   VIDYA AI — Student Spaced Repetition Flashcards
   ============================================ */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Zap, RotateCcw, AlertCircle, Volume2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { generateFlashcards } from '../../lib/ai-engine';
import { CURRICULUM_DATA } from '../../data/curriculum-data';
import { speakText, detectLanguage } from '../../lib/voice';
import { calculateSM2, createSM2Card } from '../../lib/sm2';
import { generateId } from '../../lib/utils';
import { db } from '../../lib/db';
import type { Flashcard, SM2Card, Subject, Chapter } from '../../types';
import './Flashcards.css';

export const FlashcardsPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { user, studentProfile, updateStudentProfile } = useAuthStore();

  const { language } = useAppStore();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playbackControls, setPlaybackControls] = useState<any>(null);

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    return () => {
      if (playbackControls) {
        playbackControls.stop();
      }
    };
  }, [playbackControls, currentIdx, isFlipped]);

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
            console.error('[Flashcard TTS Error]', err);
            setIsSpeaking(false);
            setPlaybackControls(null);
            alert(err.message || 'Failed to synthesize speech.');
          }
        );
        setPlaybackControls(controls);
      } catch (err: any) {
        alert(err.message || 'Failed to synthesize speech.');
      }
    }
  };

  // Load chapter, subject, and flashcards with IndexedDB caching
  useEffect(() => {
    const fetchDataAndCards = async () => {
      if (!chapterId) {
        setIsLoading(false);
        return;
      }
      try {
        const ch = await db.chapters.get(chapterId);
        if (!ch) {
          setIsLoading(false);
          return;
        }
        setChapter(ch);
        const subj = await db.subjects.get(ch.subjectId);
        if (subj) {
          setSubject(subj);
        }

        // Find existing cards in db.flashcards
        let existingCards = await db.flashcards.where('chapterId').equals(chapterId).toArray();
        const hasDummyCards = existingCards.some(fc => fc.front.includes('What is the primary concept here?') || fc.front.includes('इसका मुख्य सिद्धांत क्या है?'));
        const hasLangMismatch = existingCards.some(fc => detectLanguage(fc.front) !== language);
        if (hasDummyCards || hasLangMismatch) {
          console.log(`[Flashcards] Invalidation triggered (lang mismatch or dummy). Clearing flashcards for: ${chapterId}`);
          await db.flashcards.where('chapterId').equals(chapterId).delete();
          await db.sm2Cards.where('flashcardId').anyOf(existingCards.map(c => c.id)).delete();
          existingCards = [];
        }
        
        // Generate current hash of chapter contents
        const notesRecord = await db.notes.where('chapterId').equals(chapterId).first();
        const notesText = notesRecord ? notesRecord.content : '';
        const currentHash = `${ch.title}_${language}_${notesText.length}`;
        
        let loadedCards: Flashcard[] = [];
        const cachedHash = existingCards.length > 0 ? (existingCards[0] as any).chapterHash : '';
        
        if (existingCards.length === 15 && cachedHash === currentHash) {
          loadedCards = existingCards;
        } else {
          console.log(`[Flashcards] Generating fresh card deck of 15 cards for chapter: ${chapterId}`);
          
          if (existingCards.length > 0) {
            const cardIds = existingCards.map(c => c.id);
            await db.sm2Cards.where('flashcardId').anyOf(cardIds).delete();
            await db.flashcards.where('chapterId').equals(chapterId).delete();
          }
          
          // Generate 15 cards using the engine
          let generated = generateFlashcards(chapterId, ch.title, 15, language, subj?.name || subject?.name);
          
          // If generated count < 15 and it's a custom chapter, we might want to generate via API
          if (generated.length === 0 || !CURRICULUM_DATA[chapterId]) {
            try {
              const res = await fetch('/api/generate-chapter-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chapterId,
                  title: ch.title,
                  description: ch.description,
                  learningObjectives: ch.learningObjectives,
                  board: subj?.board || 'CBSE',
                  grade: subj?.grade || 10,
                  subject: subj?.name || 'Mathematics',
                  lang: language
                })
              });
              if (res.ok) {
                const data = await res.json();
                if (data.flashcards && data.flashcards.length > 0) {
                  generated = data.flashcards.map((fc: any, i: number) => ({
                    id: `${chapterId}_fc_${i}`,
                    chapterId,
                    front: fc.front,
                    back: fc.back,
                    difficulty: fc.difficulty || 0.3
                  }));
                  // Save generated notes and quiz questions to db cache as well!
                  if (data.overview) {
                    await db.notes.put({
                      id: `${chapterId}_notes`,
                      chapterId,
                      content: `# ${ch.title}\n\n${data.overview}\n\n## Theory\n${data.theorySections.map((s: any) => `### ${s.title}\n\n${s.content}`).join('\n\n')}`,
                      generatedBy: 'ai',
                      version: 1,
                      createdAt: Date.now()
                    });
                  }
                  if (data.quizQuestions) {
                    const mappedQs = data.quizQuestions.map((q: any, i: number) => ({
                      ...q,
                      id: `${chapterId}_q_${i}`,
                      chapterId
                    }));
                    await db.quizQuestions.bulkPut(mappedQs);
                  }
                }
              }
            } catch (apiErr) {
              console.error('Failed to generate custom chapter cards via API', apiErr);
            }
          }

          let finalCards = generated.slice(0, 15);
          if (finalCards.length < 15) {
            // Pad if less than 15
            const padDiff = 15 - finalCards.length;
            for (let i = 0; i < padDiff; i++) {
              finalCards.push({
                id: `${chapterId}_fc_pad_${i}`,
                chapterId,
                front: language === 'hi' ? `${ch.title} का मुख्य विचार क्या है?` : `What is the primary concept of ${ch.title}?`,
                back: ch.description,
                difficulty: 0.3
              });
            }
          }
          
          const mappedCards = finalCards.map((card, idx) => ({
            ...card,
            id: `${chapterId}_fc_${idx}`,
            chapterId
          }));
          
          const cardsToSave = mappedCards.map(c => ({
            ...c,
            chapterHash: currentHash
          }));
          
          await db.flashcards.bulkPut(cardsToSave as any);
          loadedCards = mappedCards;
        }
        
        setCards(loadedCards);
        setCurrentIdx(0);
        setIsFlipped(false);
        setIsFinished(false);
      } catch (err) {
        console.error('Failed to load flashcard metadata or cards', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDataAndCards();
  }, [chapterId, language]);



  if (isLoading) {
    return (
      <div className="flashcards-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Brain className="animate-pulse" size={40} color="var(--color-primary)" />
        <p style={{ marginTop: 'var(--sp-4)', color: 'var(--color-text-secondary)' }}>Loading flashcards...</p>
      </div>
    );
  }

  if (!chapter || !subject) {
    return (
      <div className="flashcards-page" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--color-error)" />
        <h2 style={{ marginTop: 'var(--sp-4)', fontWeight: 800 }}>Flashcards Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-6)' }}>We couldn't load this deck.</p>
        <Button variant="primary" onClick={() => navigate('/student/subjects')}>Back to Subjects</Button>
      </div>
    );
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRateCard = async (quality: number) => {
    const activeCard = cards[currentIdx];
    if (!user || !studentProfile || !activeCard) return;

    try {
      // 1. Fetch existing SM-2 card record
      let sm2Record = await db.sm2Cards
        .where('[userId+flashcardId]')
        .equals([user.id, activeCard.id])
        .first();

      if (!sm2Record) {
        const temp = createSM2Card(user.id, activeCard.id);
        sm2Record = {
          ...temp,
          id: generateId()
        } as SM2Card;
      }

      // 2. Calculate next parameters
      const updated = calculateSM2(
        sm2Record.easiness,
        sm2Record.interval,
        sm2Record.repetitions,
        quality
      );

      sm2Record.easiness = updated.easiness;
      sm2Record.interval = updated.interval;
      sm2Record.repetitions = updated.repetitions;
      sm2Record.nextReviewDate = updated.nextReviewDate;
      sm2Record.lastReviewDate = new Date().toISOString().split('T')[0];

      // 3. Put back to Dexie
      await db.sm2Cards.put(sm2Record);

      // Increment review counts
      setCardsReviewed(prev => prev + 1);

    } catch (err) {
      console.error('Failed to update SM-2 card spacing parameters', err);
    }

    // Move to next card
    if (currentIdx < cards.length - 1) {
      setIsFlipped(false);
      // Wait for flip transition back before changing index
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 150);
    } else {
      finishReview();
    }
  };

  const finishReview = async () => {
    setIsFinished(true);

    const earned = cards.length * 10; // 10 XP per flashcard reviewed
    setXpEarned(earned);

    if (!user || !studentProfile) return;

    try {
      // Save study session log
      await db.studySessions.add({
        id: generateId(),
        userId: user.id,
        chapterId: chapter.id,
        activityType: 'flashcard',
        durationSec: 120, // Estimated duration 2 minutes
        startedAt: Date.now() - 120000,
        endedAt: Date.now(),
        synced: false
      });

      // Update student profile XP
      const currentXP = studentProfile.xpTotal + earned;
      const nextLevelThreshold = studentProfile.level * 1000;
      let newLevel = studentProfile.level;
      if (currentXP >= nextLevelThreshold) {
        newLevel += 1;
      }

      const updatedProfile = {
        ...studentProfile,
        xpTotal: currentXP,
        level: newLevel,
        lastStudyDate: new Date().toDateString()
      };

      updateStudentProfile(updatedProfile);
      await db.studentProfiles.put(updatedProfile);

    } catch (err) {
      console.error('Failed to log flashcard study session', err);
    }
  };

  const activeCard = cards[currentIdx];
  const progressPct = (currentIdx / cards.length) * 100;

  if (isFinished) {
    return (
      <div className="flashcards-page">
        <div className="flashcards-header">
          <h2>Review Complete!</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate(subject ? `/student/subjects/${subject.id}` : '/student/subjects')}>
            Close
          </Button>
        </div>

        <Card className="results-card">
          <div style={{ marginBottom: 'var(--sp-3)', display: 'flex', justifyContent: 'center' }}>
            <Zap size={48} color="var(--color-primary)" fill="var(--color-primary)" />
          </div>
          <h1 className="results-card__title">Good Workout!</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-6)', fontSize: 'var(--fs-body)' }}>
            You've scheduled reviews for {cardsReviewed} key concepts using spaced repetition.
          </p>

          <div className="results-card__stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '400px', margin: '0 auto var(--sp-8) auto' }}>
            <div className="results-card__stat">
              <div className="results-card__stat-val" style={{ color: 'var(--color-primary)' }}>
                <Zap size={16} fill="var(--color-primary)" /> +{xpEarned}
              </div>
              <div className="results-card__stat-lbl">XP Earned</div>
            </div>
            <div className="results-card__stat">
              <div className="results-card__stat-val">
                {cardsReviewed} / {cards.length}
              </div>
              <div className="results-card__stat-lbl">Reviewed</div>
            </div>
          </div>

          <div className="results-card__buttons">
            <Button variant="primary" onClick={() => navigate(subject ? `/student/subjects/${subject.id}` : '/student/subjects')}>
              Back to Chapter
            </Button>
            <Button variant="secondary" icon={RotateCcw} onClick={() => {
              setCurrentIdx(0);
              setIsFlipped(false);
              setIsFinished(false);
              setCardsReviewed(0);
            }}>
              Review Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flashcards-page">
      <div className="flashcards-header">
        <button className="flashcards-header__back" onClick={() => navigate(subject ? `/student/subjects/${subject.id}` : '/student/subjects')}>
          <ArrowLeft size={18} /> Exit
        </button>
        <span className="flashcards-header__title">Flashcards</span>
        <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)', fontWeight: 'var(--fw-bold)' }}>
          {currentIdx + 1} of {cards.length}
        </span>
      </div>

      <ProgressBar value={progressPct} size="sm" />

      {activeCard && (
        <div className="flashcard-container">
          <div
            className={`flashcard ${isFlipped ? 'flashcard--flipped' : ''}`}
            onClick={handleFlip}
          >
            <div className="flashcard__face flashcard__face--front">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 var(--sp-4)', marginBottom: 'var(--sp-2)' }}>
                <span className="flashcard__badge">Concept</span>
                <button
                  type="button"
                  className="voice-play-btn-circle"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeakText(activeCard.front);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isSpeaking ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--sp-1)',
                    borderRadius: '50%'
                  }}
                >
                  <Volume2 size={20} />
                </button>
              </div>
              <div className="flashcard__content">
                {activeCard.front}
              </div>
              <span className="flashcard__instruction">Tap to reveal answer</span>
            </div>

            <div className="flashcard__face flashcard__face--back">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 var(--sp-4)', marginBottom: 'var(--sp-2)' }}>
                <span className="flashcard__badge" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>Explanation</span>
                <button
                  type="button"
                  className="voice-play-btn-circle"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeakText(activeCard.back);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isSpeaking ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--sp-1)',
                    borderRadius: '50%'
                  }}
                >
                  <Volume2 size={20} />
                </button>
              </div>
              <div className="flashcard__content">
                {activeCard.back}
              </div>
              <span className="flashcard__instruction">Rate your memory below</span>
            </div>
          </div>
        </div>
      )}

      {isFlipped && (
        <div className="quality-actions">
          <button
            className="quality-btn quality-btn--again"
            onClick={() => handleRateCard(1)}
          >
            <span className="quality-btn__label">Again</span>
            <span className="quality-btn__desc">Forgot</span>
          </button>
          <button
            className="quality-btn quality-btn--hard"
            onClick={() => handleRateCard(3)}
          >
            <span className="quality-btn__label">Hard</span>
            <span className="quality-btn__desc">Hesitated</span>
          </button>
          <button
            className="quality-btn quality-btn--good"
            onClick={() => handleRateCard(4)}
          >
            <span className="quality-btn__label">Good</span>
            <span className="quality-btn__desc">Got it!</span>
          </button>
          <button
            className="quality-btn quality-btn--easy"
            onClick={() => handleRateCard(5)}
          >
            <span className="quality-btn__label">Easy</span>
            <span className="quality-btn__desc">Super simple</span>
          </button>
        </div>
      )}
    </div>
  );
};
