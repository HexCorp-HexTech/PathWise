/* ============================================
   VIDYA AI — Subject Explorer & Chapter View
   ============================================ */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Brain, FileText, Zap, CheckCircle, Lock, Clock, Star, MessageSquare, Copy, Check, Printer, Volume2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ProgressBar, ProgressRing } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { db } from '../../lib/db';
import { generateNotes, getChapterConfig } from '../../lib/ai-engine';
import { CURRICULUM_DATA } from '../../data/curriculum-data';
import { speakText } from '../../lib/voice';
import type { Subject, Chapter } from '../../types';
import { MarkdownRenderer } from '../../components/chat/MarkdownRenderer';
import { useTranslation } from '../../lib/translations';
import './Subjects.css';

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

/* Subject Explorer */
export const SubjectExplorer: React.FC = () => {
  const navigate = useNavigate();
  const { studentProfile } = useAuthStore();
  const { t, language } = useTranslation();
  const [subjectsList, setSubjectsList] = useState<SubjectProgressDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      if (!studentProfile) return;
      const grade = studentProfile.grade;
      const board = studentProfile.board;

      const dbSubjects = await db.subjects.where('board').equals(board).toArray();
      const matchedSubjects = Array.from(
        new Map(
          dbSubjects
            .filter(s => Number(s.grade) === Number(grade))
            .map(s => [s.id, s])
        ).values()
      ).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      const list: SubjectProgressDetail[] = [];

      for (const subj of matchedSubjects) {
        const subjChapters = await db.chapters.where('subjectId').equals(subj.id).toArray();
        subjChapters.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        let completed = 0;
        let sumMastery = 0;
        const weakChs: string[] = [];

        for (const ch of subjChapters) {
          const attempts = await db.quizAttempts
            .where('userId').equals(studentProfile.userId)
            .and(att => att.chapterId === ch.id)
            .toArray();

          const maxScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
          if (maxScore >= 0.8) {
            completed++;
          }

          const bktRecord = await db.bktMastery
            .where('[userId+chapterId+skillId]')
            .equals([studentProfile.userId, ch.id, ch.id])
            .first();

          const chMastery = bktRecord ? bktRecord.pKnow : maxScore;
          sumMastery += chMastery;

          if (chMastery > 0 && chMastery < 0.75) {
            weakChs.push(ch.id);
          }
        }

        const avgMastery = subjChapters.length > 0 ? sumMastery / subjChapters.length : 0;

        list.push({
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

      setSubjectsList(list);
      setLoading(false);
    };

    fetchSubjectDetails();
  }, [studentProfile]);

  if (loading) {
    return (
      <div className="subjects-loading">
        <Brain className="animate-spin text-primary" size={32} />
        <p>Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="subjects-page">
      <div className="subjects-header">
        <h1>{t('yourSubjects')}</h1>
        <p>{language === 'hi' ? 'मानक पाठ्यक्रम अध्यायों को खोजने के लिए एक विषय चुनें' : 'Select a subject to explore standard curriculum chapters'}</p>
      </div>

      <div className="subjects-grid">
        {subjectsList.map((subj) => (
          <Card
            key={subj.id}
            variant="interactive"
            className="subject-card-lg"
            onClick={() => navigate(`/student/subjects/${subj.id}`)}
          >
            <div className="subject-card-lg__top" style={{ background: `${subj.color}10` }}>
              <ProgressRing
                value={subj.mastery * 100}
                size={64}
                strokeWidth={5}
                color={subj.color}
              />
            </div>
            <div className="subject-card-lg__info">
              <h3>{t(subj.name)}</h3>
              <p>
                {language === 'hi'
                  ? `${subj.completedChapters}/${subj.totalChapters} अध्याय पूर्ण`
                  : `${subj.completedChapters}/${subj.totalChapters} chapters completed`}
              </p>
              <ProgressBar value={subj.mastery * 100} size="sm" color={subj.color} animated={false} />
            </div>
            {subj.weakChapters.length > 0 && (
              <div className="subject-card-lg__weak">
                <Brain size={12} />{' '}
                {subj.weakChapters.length}{' '}
                {language === 'hi' ? 'अभ्यास की आवश्यकता' : 'need practice'}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

/* Subject Detail - Chapter List */
export const SubjectDetail: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams<{ subjectId: string }>();
  const { studentProfile } = useAuthStore();
  const { t, language } = useTranslation();
  const [chaptersList, setChaptersList] = useState<{ id: string; title: string; description: string; estimatedTimeMin: number; isCompleted: boolean; isLocked: boolean; isWeak: boolean }[]>([]);
  const [subjectDetails, setSubjectDetails] = useState<{ name: string; color: string; mastery: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const [matchedSubject, setMatchedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    const fetchChaptersProgress = async () => {
      if (!studentProfile || !subjectId) return;

      const subj = await db.subjects.get(subjectId);
      if (!subj) {
        setLoading(false);
        return;
      }
      setMatchedSubject(subj);

      const subjChapters = await db.chapters.where('subjectId').equals(subjectId).toArray();
      subjChapters.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      const list = [];
      let completedCount = 0;
      let sumMastery = 0;

      for (let i = 0; i < subjChapters.length; i++) {
        const ch = subjChapters[i];
        const attempts = await db.quizAttempts
          .where('userId').equals(studentProfile.userId)
          .and(att => att.chapterId === ch.id)
          .toArray();

        const maxScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
        const isCompleted = maxScore >= 0.8;

        if (isCompleted) {
          completedCount++;
        }

        const bktRecord = await db.bktMastery
          .where('[userId+chapterId+skillId]')
          .equals([studentProfile.userId, ch.id, ch.id])
          .first();

        const chMastery = bktRecord ? bktRecord.pKnow : maxScore;
        sumMastery += chMastery;

        const isWeak = chMastery > 0 && chMastery < 0.75;
        // Lock rules: chapter 1 is always unlocked. Succeeding chapters unlock if previous chapter is completed.
        const isLocked = i > 0 && !(await isChapterCompleted(subjChapters[i - 1].id, studentProfile.userId));

        list.push({
          id: ch.id,
          title: ch.title,
          description: ch.description,
          estimatedTimeMin: ch.estimatedTimeMin,
          isCompleted,
          isLocked,
          isWeak,
        });
      }

      setSubjectDetails({
        name: subj.name,
        color: subj.color,
        mastery: subjChapters.length > 0 ? (sumMastery / subjChapters.length) : 0,
      });
      setChaptersList(list);
      setLoading(false);
    };

    const isChapterCompleted = async (chId: string, uId: string) => {
      const attempts = await db.quizAttempts.where('userId').equals(uId).and(a => a.chapterId === chId).toArray();
      return attempts.length > 0 && Math.max(...attempts.map(a => a.score)) >= 0.8;
    };

    fetchChaptersProgress();
  }, [subjectId, studentProfile]);

  if (loading) return <div className="subjects-loading"><Brain className="animate-spin text-primary" size={32} /><p>{language === 'hi' ? 'अध्याय लोड हो रहे हैं...' : 'Loading syllabus chapters...'}</p></div>;
  if (!matchedSubject) return <div className="subjects-page"><p>{language === 'hi' ? 'विषय नहीं मिला' : 'Subject not found'}</p></div>;

  return (
    <div className="subjects-page">
      <div className="subjects-header subjects-header--detail">
        <button className="subjects-back" onClick={() => navigate('/student/subjects')}>
          <ArrowLeft size={18} /> {language === 'hi' ? 'विषयों पर वापस जाएं' : 'Back to Subjects'}
        </button>
        <div>
          <h1>{t(subjectDetails?.name ?? '')}</h1>
          <p>
            {language === 'hi'
              ? `${chaptersList.length} पाठ्यक्रम अध्याय • ${Math.round((subjectDetails?.mastery ?? 0) * 100)}% कुल महारत`
              : `${chaptersList.length} syllabus chapters • ${Math.round((subjectDetails?.mastery ?? 0) * 100)}% overall mastery`}
          </p>
        </div>
      </div>

      <div className="chapter-list">
        {chaptersList.map((chapter, i) => (
          <Card
            key={chapter.id}
            variant={!chapter.isLocked ? 'interactive' : 'default'}
            className={`chapter-item ${chapter.isCompleted ? 'chapter-item--done' : ''} ${chapter.isLocked ? 'chapter-item--locked' : ''}`}
            onClick={() => !chapter.isLocked && navigate(`/student/subjects/${subjectId}/chapters/${chapter.id}`)}
          >
            <div className="chapter-item__num">
              {chapter.isCompleted ? <CheckCircle size={18} color="var(--color-success)" /> :
               chapter.isLocked ? <Lock size={18} /> :
               <span>{i + 1}</span>}
            </div>
            <div className="chapter-item__info">
              <h3>{chapter.title}</h3>
              <p>{chapter.description}</p>
              <div className="chapter-item__meta">
                <span><Clock size={12} /> {chapter.estimatedTimeMin} min</span>
                {chapter.isWeak && <span className="chapter-item__weak"><Brain size={12} /> {language === 'hi' ? 'अभ्यास आवश्यक' : 'Practice needed'}</span>}
              </div>
            </div>
            {!chapter.isLocked && !chapter.isCompleted && (
              <Button variant="primary" size="sm">{language === 'hi' ? 'शुरू करें' : 'Start'}</Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

/* Chapter View */
export const ChapterView: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'quiz' | 'flashcards'>('notes');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const { language } = useAppStore();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playbackControls, setPlaybackControls] = useState<any>(null);

  const [notes, setNotes] = useState<{ id: string; content: string } | null>(null);
  const [formulaSheet, setFormulaSheet] = useState<{ name: string; formula: string; desc: string }[]>([]);
  const [mnemonicTricks, setMnemonicTricks] = useState<string[]>([]);
  const [definitions, setDefinitions] = useState<{ term: string; definition: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapterAndSubject = async () => {
      if (!chapterId) return;
      setLoading(true);
      const ch = await db.chapters.get(chapterId);
      setChapter(ch || null);
      if (ch) {
        const subj = await db.subjects.get(ch.subjectId);
        setSubject(subj || null);
      }
      setLoading(false);
    };
    fetchChapterAndSubject();
  }, [chapterId]);

  useEffect(() => {
    const loadContent = async () => {
      if (!chapter) return;
      setLoading(true);
      try {
        const isCustom = !CURRICULUM_DATA[chapter.id];
        let notesRecord = await db.notes.where('chapterId').equals(chapter.id).first();
        let rawData: any = null;

        if (notesRecord) {
          const lowerContent = notesRecord.content.toLowerCase();
          // Check actual Hindi character presence vs language setting
          const hasHindiChars = /[\u0900-\u097F]/.test(notesRecord.content);
          const isLangMismatch = (language === 'hi' && !hasHindiChars) || (language === 'en' && hasHindiChars);
          if (isLangMismatch || lowerContent.includes('general constant ratio') || lowerContent.includes('essential academic principles')) {
            console.log(`[ChapterView] Invalidation triggered (lang=${language}, hindiChars=${hasHindiChars}). Clearing notes cache for: ${chapter.id}`);
            await db.notes.delete(notesRecord.id);
            await db.quizQuestions.where('chapterId').equals(chapter.id).delete();
            await db.flashcards.where('chapterId').equals(chapter.id).delete();
            notesRecord = undefined;
          } else {
            setNotes({ id: notesRecord.id, content: notesRecord.content });
            if ((notesRecord as any).rawJson) {
              try {
                rawData = JSON.parse((notesRecord as any).rawJson);
              } catch (e) {
                console.error('Failed to parse notes rawJson', e);
              }
            }
          }
        }

        if (isCustom && !notesRecord) {
          console.log(`[ChapterView] Fetching custom chapter content via API for: ${chapter.id}`);
          try {
            const res = await fetch('/api/generate-chapter-content', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chapterId: chapter.id,
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
              rawData = data;

              const markdownContent = convertAiJsonToMarkdown(data, chapter.title, subject?.name || 'Mathematics', subject?.board || 'CBSE', subject?.grade || 10);

              notesRecord = {
                id: `${chapter.id}_notes`,
                chapterId: chapter.id,
                content: markdownContent,
                generatedBy: 'ai',
                version: 1,
                createdAt: Date.now()
              };
              (notesRecord as any).rawJson = JSON.stringify(data);

              await db.notes.put(notesRecord);
              setNotes({ id: notesRecord.id, content: markdownContent });

              if (data.quizQuestions && data.quizQuestions.length > 0) {
                const mappedQs = data.quizQuestions.map((q: any, i: number) => ({
                  ...q,
                  id: `${chapter.id}_q_${i}`,
                  chapterId: chapter.id,
                  tags: q.tags || [chapter.id]
                }));
                await db.quizQuestions.bulkPut(mappedQs);
              }

              if (data.flashcards && data.flashcards.length > 0) {
                const mappedFcs = data.flashcards.map((fc: any, i: number) => ({
                  ...fc,
                  id: `${chapter.id}_fc_${i}`,
                  chapterId: chapter.id,
                  chapterHash: `${chapter.title}_${language}_${markdownContent.length}`
                }));
                await db.flashcards.bulkPut(mappedFcs);
              }
            } else {
              console.error('[ChapterView] Failed to generate custom chapter content.');
            }
          } catch (fetchErr) {
            console.error('[ChapterView] Network/API error fetching custom content. Using offline fallback...', fetchErr);
          }
        }

        if (rawData) {
          // Pre-register in CURRICULUM_DATA so the AI Tutor can see it!
          CURRICULUM_DATA[chapter.id] = {
            id: chapter.id,
            topicName: chapter.title,
            subject: subject?.name || 'Mathematics',
            board: subject?.board || 'CBSE',
            grade: subject?.grade || 10,
            overview: rawData.overview,
            theorySections: rawData.theorySections || [],
            formulas: rawData.formulas || [],
            workedExamples: rawData.workedExamples || [],
            commonMistakes: rawData.commonMistakes || [],
            examTricks: rawData.examTricks || [],
            memoryTips: rawData.memoryTips || rawData.examTricks || [],
            summaryPoints: rawData.summaryPoints || [],
            diagramSvg: rawData.diagramSvg || `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" /><text x="120" y="65" fill="var(--color-text-primary)">${chapter.title}</text></svg>`,
            questionsPool: rawData.quizQuestions || [],
            flashcardPool: rawData.flashcards || []
          };

          const isBio = subject?.name?.toLowerCase().includes('biology') || chapter.id.includes('biology');
          const formulas = isBio ? [] : (rawData.formulas || []).map((f: any) => ({
            name: f.name,
            formula: f.formula,
            desc: f.explanation
          }));
          setFormulaSheet(formulas);
          setMnemonicTricks(rawData.memoryTips || rawData.examTricks || []);

          const summaryList = (rawData.summaryPoints || []).map((pt: string) => {
            const parts = pt.split(':');
            if (parts.length > 1) {
              return { term: parts[0].trim(), definition: parts[1].trim() };
            }
            return { term: 'Core Concept', definition: pt };
          });
          setDefinitions(summaryList.length > 0 ? summaryList : [{ term: 'Topic Overview', definition: rawData.overview }]);
        } else {
          const config = getChapterConfig(chapter.id, chapter.title, subject?.name);
          
          // Pre-register template config in CURRICULUM_DATA so the AI Tutor can see it!
          CURRICULUM_DATA[chapter.id] = config;

          if (!notesRecord) {
            const generated = generateNotes(chapter.id, chapter.title, language, subject?.name);
            setNotes(generated);

            // Save standard fallback notes to IndexedDB cache
            await db.notes.put({
              id: `${chapter.id}_notes`,
              chapterId: chapter.id,
              content: generated.content,
              generatedBy: 'curated',
              version: 1,
              createdAt: Date.now()
            });
          }

          const isBio = subject?.name?.toLowerCase().includes('biology') || chapter.id.includes('biology');
          const formulas = isBio ? [] : (config.formulas || []).map(f => ({
            name: f.name,
            formula: f.formula,
            desc: f.explanation
          }));
          setFormulaSheet(formulas);
          setMnemonicTricks(config.memoryTips || []);

          const summaryList = (config.summaryPoints || []).map(pt => {
            const parts = pt.split(':');
            if (parts.length > 1) {
              return { term: parts[0].trim(), definition: pt.substring(pt.indexOf(':') + 1).trim() };
            }
            return { term: 'Core Concept', definition: pt };
          });
          setDefinitions(summaryList.length > 0 ? summaryList : [{ term: 'Topic Overview', definition: config.overview }]);
        }
      } catch (err) {
        console.error('Failed to load or generate chapter content', err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [chapter, subject, language]);

function convertAiJsonToMarkdown(data: any, title: string, subject: string, board: string, grade: number): string {
  let text = `<div class="pdf-cover-page">
  <div class="pdf-cover-badge">${board} • Grade ${grade}</div>
  <h1 class="pdf-cover-title">${title}</h1>
  <div class="pdf-cover-subtitle">Complete Concept Notes & Diagnostic Guide</div>
  <div class="pdf-cover-metadata">Subject: ${subject} • Board: ${board} • Grade: Class ${grade} • Compiled by Pathwise AI Engine</div>
</div>\n\n`;

  text += `\n\n---\n**Curriculum Focus Information**:\n- **Board**: ${board}\n- **Class/Grade**: Grade ${grade}\n- **Subject**: ${subject}\n- **Chapter**: ${title}\n---\n\n`;

  text += `## Executive Summary & Overview\n\n${data.overview || ''}\n\n`;

  if (data.theorySections && data.theorySections.length > 0) {
    text += `## Core Concepts and Explanations\n\n`;
    data.theorySections.forEach((s: any) => {
      text += `### ${s.title}\n\n${s.content}\n\n`;
    });
  }

  if (data.formulas && data.formulas.length > 0) {
    text += `## Formula Cheat Sheet\n\n`;
    text += `| Formula Name | Equation | Explanation |\n`;
    text += `| :--- | :---: | :--- |\n`;
    data.formulas.forEach((f: any) => {
      text += `| **${f.name}** | $${f.formula}$ | ${f.explanation} |\n`;
    });
    text += `\n`;
  }

  if (data.workedExamples && data.workedExamples.length > 0) {
    text += `## Step-by-Step Worked Problems\n\n`;
    data.workedExamples.forEach((ex: any, idx: number) => {
      text += `### Problem ${idx + 1}:\n${ex.question}\n\n**Step-by-step Solution**:\n`;
      if (Array.isArray(ex.stepByStep)) {
        ex.stepByStep.forEach((step: string, stepIdx: number) => {
          text += `${stepIdx + 1}. ${step}\n`;
        });
      } else {
        text += `${ex.stepByStep}\n`;
      }
      text += `\n**Final Answer**: ${ex.solution}\n\n`;
    });
  }

  if (data.commonMistakes && data.commonMistakes.length > 0) {
    text += `## Common Mistakes to Avoid\n\n`;
    text += `| Common Pitfall | Recommended Correction | Explanation |\n`;
    text += `| :--- | :--- | :--- |\n`;
    data.commonMistakes.forEach((m: any) => {
      text += `| *${m.mistake}* | **${m.correction}** | ${m.explanation} |\n`;
    });
    text += `\n`;
  }

  if ((data.examTricks && data.examTricks.length > 0) || (data.memoryTips && data.memoryTips.length > 0)) {
    text += `## High-Yield Exam Preparation\n\n`;
    if (data.examTricks) {
      data.examTricks.forEach((trick: string) => {
        text += `> [!TIP]\n> **Exam Trick**: ${trick}\n\n`;
      });
    }
    if (data.memoryTips) {
      data.memoryTips.forEach((tip: string) => {
        text += `> [!NOTE]\n> **Memory Mnemonic**: ${tip}\n\n`;
      });
    }
  }

  if (data.summaryPoints && data.summaryPoints.length > 0) {
    text += `## Key Takeaways\n\n`;
    data.summaryPoints.forEach((point: string) => {
      text += `- ${point}\n`;
    });
    text += `\n`;
  }

  text += `## Revision Checklist\n\n`;
  text += `- [ ] Memorize the core definitions.\n`;
  text += `- [ ] Master the formulas on the cheat sheet.\n`;
  text += `- [ ] Re-solve the worked examples without looking.\n`;
  text += `- [ ] Double-check common exam pitfalls.\n`;
  text += `- [ ] Complete the diagnostic quiz and check solutions.\n`;

  return text;
}

  useEffect(() => {
    return () => {
      if (playbackControls) {
        playbackControls.stop();
      }
    };
  }, [playbackControls, chapterId, activeTab]);

  const activeNotesContent = notes?.content || '';
  const placeholderRegex = /placeholder|todo|temp_|lorem|dummy_content|fixme/i;
  const isNotesValid = !activeNotesContent || !placeholderRegex.test(activeNotesContent);

  useEffect(() => {
    if (activeNotesContent && placeholderRegex.test(activeNotesContent)) {
      console.error(`[Notes Content Validation Error] Placeholders detected in chapter notes for chapter: ${chapterId}`);
    }
  }, [activeNotesContent, chapterId]);

  if (loading) return <div className="subjects-loading"><Brain className="animate-spin text-primary" size={32} /><p>Loading chapter notes...</p></div>;
  if (!chapter) return <div className="subjects-page"><p>Chapter not found</p></div>;

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

  const handleToggleSpeech = async () => {
    if (isSpeaking) {
      if (playbackControls) {
        playbackControls.stop();
      }
      setIsSpeaking(false);
      setPlaybackControls(null);
    } else {
      try {
        const plainText = stripMarkdown(activeNotesContent);
        const controls = await speakText(
          plainText,
          () => setIsSpeaking(true),
          () => {
            setIsSpeaking(false);
            setPlaybackControls(null);
          },
          (err) => {
            console.error('[Notes TTS Error]', err);
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

  const handleCopyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const handlePrintNotes = () => {
    window.print();
  };

  const tabs = [
    { id: 'notes' as const, label: language === 'hi' ? 'पाठ' : 'Notes', icon: <FileText size={16} /> },
    { id: 'quiz' as const, label: language === 'hi' ? 'प्रश्नोत्तरी' : 'Quiz', icon: <Zap size={16} /> },
    { id: 'flashcards' as const, label: language === 'hi' ? 'फ्लैशकार्ड' : 'Flashcards', icon: <Star size={16} /> },
  ];

  return (
    <div className="chapter-page">
      <div className="chapter-header">
        <button className="subjects-back" onClick={() => navigate(`/student/subjects/${subjectId}`)}>
          <ArrowLeft size={18} /> {language === 'hi' ? 'अध्यायों पर वापस जाएं' : 'Back to Chapters'}
        </button>
        <div style={{ flex: 1, marginLeft: 'var(--sp-4)' }}>
          <h1>{chapter.title}</h1>
          <p>{chapter.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <Button variant="ghost" size="sm" icon={Printer} onClick={handlePrintNotes}>
            {language === 'hi' ? 'पाठ प्रिंट करें' : 'Print Notes'}
          </Button>
          <Button variant="primary" size="sm" icon={MessageSquare} onClick={() => navigate('/student/tutor')}>
            {language === 'hi' ? 'ज्ञानी से पूछें' : 'Ask Gyani'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="chapter-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`chapter-tab ${activeTab === tab.id ? 'chapter-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="chapter-content">
        {activeTab === 'notes' && (
          <div className="chapter-notes-layout">
            {/* Main Notes Area */}
            <div className="chapter-notes__body">
              {!isNotesValid ? (
                <div className="notes-validation-failed" style={{ padding: 'var(--sp-10)', textAlign: 'center', background: 'var(--color-surface-bg)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-error)' }}>
                  <Brain size={48} className="animate-pulse" style={{ color: 'var(--color-error)', margin: '0 auto var(--sp-4) auto' }} />
                  <h3 style={{ fontSize: 'var(--fs-h4)', fontWeight: 'bold', color: 'var(--color-error)' }}>{language === 'hi' ? 'सामग्री जनरेशन विफल। पुनरुत्पादित किया जा रहा है...' : 'Content generation failed. Regenerating...'}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-body-sm)', marginTop: 'var(--sp-2)' }}>
                    {language === 'hi' ? 'उच्च गुणवत्ता, पाठ्यक्रम-संगत पाठ संकलित किए जा रहे हैं।' : 'High-quality, curriculum-compliant notes are being compiled.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="notes-action-bar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--sp-4)' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleToggleSpeech}
                      className={`voice-play-btn ${isSpeaking ? 'voice-play-btn--speaking' : ''}`}
                    >
                      <Volume2 size={16} style={{ marginRight: 'var(--sp-2)', color: isSpeaking ? 'var(--color-primary)' : 'inherit' }} />
                      {isSpeaking ? (language === 'hi' ? 'पढ़ना बंद करें' : 'Stop Reading') : (language === 'hi' ? 'ज़ोर से पढ़ें' : 'Read Aloud')}
                    </Button>
                  </div>
                  <MarkdownRenderer content={activeNotesContent} />
                </>
              )}
            </div>

            {/* Side Quick Revision / Formula Section */}
            <aside className="chapter-notes__sidebar">
              <Card padding="md" className="sidebar-card">
                <h3>{language === 'hi' ? 'त्वरित पुनरीक्षण' : 'Quick Revision'}</h3>
                <div className="sidebar-section">
                  <h4>{language === 'hi' ? 'मुख्य परिभाषाएँ' : 'Key Definitions'}</h4>
                  {definitions.map((d, index) => (
                    <p key={index} style={{ marginBottom: '8px' }}><strong>{d.term}</strong>: {d.definition}</p>
                  ))}
                </div>
                {mnemonicTricks.length > 0 && (
                  <>
                    <hr className="sidebar-divider" />
                    <div className="sidebar-section">
                      <h4>{language === 'hi' ? 'याद रखने की ट्रिक' : 'Mnemonic Tricks'}</h4>
                      {mnemonicTricks.map((trick, index) => (
                        <p key={index} style={{ marginBottom: '8px' }}>{trick}</p>
                      ))}
                    </div>
                  </>
                )}
              </Card>

              {/* Dynamic Formula Sheet Card */}
              {formulaSheet.length > 0 && (
                <Card padding="md" className="sidebar-card sidebar-card--formulas">
                  <h3>{language === 'hi' ? 'फार्मूला शीट' : 'Formula Sheet'}</h3>
                  <div className="formula-list">
                    {formulaSheet.map((f, index) => (
                      <div key={index} className="formula-item">
                        <div className="formula-item__header">
                          <span>{f.name}</span>
                          <button
                            className="formula-item__copy-btn"
                            title="Copy formula text"
                            onClick={() => handleCopyFormula(f.formula)}
                          >
                            {copiedFormula === f.formula ? (
                              <Check size={12} className="text-success" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                        <code className="formula-item__code">{f.formula}</code>
                        <small className="formula-item__desc">{f.desc}</small>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </aside>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="chapter-quiz-start">
            <div className="chapter-quiz-start__icon" style={{ color: 'var(--color-primary)' }}>
              <Zap size={48} />
            </div>
            <h2>{language === 'hi' ? 'प्रश्नोत्तरी के लिए तैयार हैं?' : 'Ready for a Quiz?'}</h2>
            <p>
              {language === 'hi'
                ? `${chapter.title} पर इस अनुकूलित नैदानिक समीक्षा को पूरा करें`
                : `Complete this adaptively styled diagnostic review on ${chapter.title}`}
            </p>
            <div className="chapter-quiz-start__info">
              <span><Clock size={14} /> ~12 {language === 'hi' ? 'मिनट' : 'minutes'}</span>
              <span><Zap size={14} /> 20+ {language === 'hi' ? 'प्रश्नों का पूल' : 'questions pool'}</span>
              <span><Brain size={14} /> {language === 'hi' ? 'अनुकूलनशील BKT इंजन' : 'Adaptive BKT engine'}</span>
            </div>
            <Button variant="primary" size="lg" onClick={() => navigate(`/student/quiz/${chapterId}`)}>
              {language === 'hi' ? 'प्रश्नोत्तरी शुरू करें' : 'Start Quiz'}
            </Button>
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div className="chapter-quiz-start">
            <div className="chapter-quiz-start__icon" style={{ color: 'var(--color-success)' }}>
              <Star size={48} />
            </div>
            <h2>{language === 'hi' ? 'स्मार्ट फ्लैशकार्ड' : 'Smart Flashcards'}</h2>
            <p>
              {language === 'hi'
                ? `${chapter.title} के लिए अंतराल दोहराव शब्दावली और तथ्यों की समीक्षा करें`
                : `Review spaced repetition vocabulary and facts for ${chapter.title}`}
            </p>
            <div className="chapter-quiz-start__info">
              <span><Star size={14} /> 15+ {language === 'hi' ? 'कार्ड' : 'cards'}</span>
              <span><Brain size={14} /> SuperMemo SM-2 {language === 'hi' ? 'एल्गोरिदम' : 'algorithm'}</span>
            </div>
            <Button variant="primary" size="lg" onClick={() => navigate(`/student/flashcards/${chapterId}`)}>
              {language === 'hi' ? 'समीक्षा शुरू करें' : 'Start Review'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
