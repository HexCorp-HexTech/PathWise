/* ============================================
   VIDYA AI — Teacher Assignment Manager
   ============================================ */
import React, { useState, useEffect } from 'react';
import {
  ClipboardList, Plus, Sparkles, Send, Trash, CheckCircle2,
  Calendar, Users, RefreshCw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { generateQuizQuestions } from '../../lib/ai-engine';
import { generateId } from '../../lib/utils';
import { db } from '../../lib/db';
import { useAuthStore } from '../../store/authStore';
import type { Assignment, QuizQuestion, Subject, Chapter } from '../../types';

export const AssignmentsPage: React.FC = () => {
  const { user, teacherProfile } = useAuthStore();
  const activeCode = teacherProfile?.activeClassroomCode || '';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Curriculum states
  const [dbSubjects, setDbSubjects] = useState<Subject[]>([]);
  const [dbChapters, setDbChapters] = useState<Chapter[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const subjs = await db.subjects.toArray();
        const chaps = await db.chapters.toArray();
        setDbSubjects(subjs);
        setDbChapters(chaps);
        if (subjs.length > 0 && !selectedSubject) {
          setSelectedSubject(subjs[0].id);
        }
      } catch (err) {
        console.error('Failed to load curriculum for assignments page', err);
      }
    };
    fetchCurriculum();
  }, []);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const count = await db.assignments.count();

      // Seed mock assignments if none exist
      if (count === 0) {
        const chaps = await db.chapters.toArray();
        const validChapter = chaps.length > 0 ? chaps[0] : null;
        if (validChapter) {
          const subjs = await db.subjects.toArray();
          const validSubj = subjs.find(s => s.id === validChapter.subjectId);
          const demoQuestions = generateQuizQuestions(validChapter.id, validChapter.title, 3, 0.4, 'en', validSubj?.name);
          await db.assignments.add({
            id: generateId(),
            teacherId: 'teacher-priya-001',
            classId: 'DPS-001',
            title: `${validChapter.title} Homework`,
            description: `Review core concepts of ${validChapter.title}.`,
            chapterId: validChapter.id,
            questions: demoQuestions,
            dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days from now
            createdAt: Date.now(),
            isPublished: true,
            classCode: activeCode || undefined
          });
        }
      }

      let list = await db.assignments.reverse().toArray();
      if (activeCode) {
        list = list.filter(a => a.classCode === activeCode);
      }
      setAssignments(list);
    } catch (err) {
      console.error('Failed to load assignments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();

    const handleClassChange = () => {
      loadAssignments();
    };
    window.addEventListener('classroomChanged', handleClassChange);
    return () => {
      window.removeEventListener('classroomChanged', handleClassChange);
    };
  }, [user, teacherProfile]);

  const handleAIQuestionsGenerate = () => {
    if (!selectedChapter) return;
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const chapterObj = dbChapters.find(c => c.id === selectedChapter);
        const subjObj = dbSubjects.find(s => s.id === chapterObj?.subjectId);
        // Generate a standard balanced homework sheet of 10 questions
        const questions = generateQuizQuestions(selectedChapter, chapterObj?.title || 'Topic', 10, 0.5, 'en', subjObj?.name);
        setGeneratedQuestions(questions);
      } catch (err) {
        console.error('Failed to generate homework questions', err);
      } finally {
        setIsGenerating(false);
      }
    }, 800);
  };

  const handlePublishAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || generatedQuestions.length === 0) return;

    // Enforce date validation: cannot select past date
    const todayStr = new Date().toISOString().split('T')[0];
    if (dueDate && dueDate < todayStr) {
      alert('Due date cannot be in the past. Please select a valid future date.');
      return;
    }

    try {
      const newAssignment: Assignment = {
        id: generateId(),
        teacherId: user?.id || 'teacher-priya-001',
        classId: 'DPS-001',
        title,
        description,
        chapterId: selectedChapter || undefined,
        questions: generatedQuestions,
        dueDate: dueDate || undefined,
        createdAt: Date.now(),
        isPublished: true,
        classCode: activeCode || undefined
      };

      await db.assignments.add(newAssignment);

      // Reset
      setTitle('');
      setDescription('');
      setSelectedChapter('');
      setDueDate('');
      setGeneratedQuestions([]);
      setIsCreating(false);

      await loadAssignments();
    } catch (err) {
      console.error('Failed to publish assignment', err);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await db.assignments.delete(id);
      await loadAssignments();
    } catch (err) {
      console.error('Failed to delete assignment', err);
    }
  };

  const chaptersForSubject = dbChapters.filter(c => c.subjectId === selectedSubject);

  if (isLoading && assignments.length === 0) {
    return (
      <div className="tdash" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
        <RefreshCw className="animate-spin" size={36} color="var(--color-primary)" />
        <p style={{ marginTop: 'var(--sp-4)', color: 'var(--color-text-secondary)' }}>Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="tdash" style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--sp-6)' }}>
      {/* Header */}
      <div className="tdash__header" style={{ marginBottom: 'var(--sp-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)', fontWeight: 'var(--fw-bold)', textTransform: 'uppercase' }}>Classroom tasks</span>
          <h1 style={{ fontSize: 'var(--fs-h2)', fontWeight: 800 }}>Assignments Manager</h1>
        </div>
        {!isCreating && (
          <Button variant="primary" icon={Plus} onClick={() => setIsCreating(true)}>
            Create Assignment
          </Button>
        )}
      </div>

      {isCreating ? (
        <Card style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
            <h3 style={{ fontWeight: 800, fontSize: 'var(--fs-h3)' }}>New Assignment</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
          </div>

          <form onSubmit={handlePublishAssignment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div>
              <label style={{ fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-bold)', display: 'block', marginBottom: 'var(--sp-1)' }}>TITLE</label>
              <input
                type="text"
                className="tstudents__search"
                style={{ width: '100%' }}
                placeholder="e.g. Algebra Basics Practice Quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-bold)', display: 'block', marginBottom: 'var(--sp-1)' }}>DESCRIPTION</label>
              <textarea
                className="post-doubt-form__textarea"
                placeholder="Add brief instructions for students..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-bold)', display: 'block', marginBottom: 'var(--sp-1)' }}>SUBJECT</label>
                <select
                  className="tstudents__select"
                  style={{ width: '100%' }}
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedChapter('');
                  }}
                >
                  {dbSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-bold)', display: 'block', marginBottom: 'var(--sp-1)' }}>CHAPTER</label>
                <select
                  className="tstudents__select"
                  style={{ width: '100%' }}
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  required
                >
                  <option value="">Select Chapter...</option>
                  {chaptersForSubject.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-bold)', display: 'block', marginBottom: 'var(--sp-1)' }}>DUE DATE</label>
                <input
                  type="date"
                  className="tstudents__search"
                  style={{ width: '100%' }}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 'var(--sp-2)' }}>
              <Button
                variant="secondary"
                type="button"
                icon={Sparkles}
                disabled={!selectedChapter || isGenerating}
                onClick={handleAIQuestionsGenerate}
              >
                {isGenerating ? 'Generating Qs...' : 'AI Generate Questions'}
              </Button>
            </div>

            {/* Questions preview */}
            {generatedQuestions.length > 0 && (
              <div style={{ marginTop: 'var(--sp-4)', background: 'var(--color-surface-bg)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontWeight: 800, fontSize: 'var(--fs-body)', marginBottom: 'var(--sp-3)' }}>
                  Questions Preview ({generatedQuestions.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {generatedQuestions.map((q, idx) => (
                    <div key={q.id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--sp-2)' }}>
                      <div style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-bold)' }}>
                        Q{idx + 1}: {q.questionText}
                      </div>
                      <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-success)', fontWeight: 'var(--fw-semibold)' }}>
                        Answer: {q.correctAnswer}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--sp-4)' }}>
              <Button
                variant="primary"
                type="submit"
                icon={Send}
                disabled={!title.trim() || generatedQuestions.length === 0}
              >
                Publish to Class
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {/* List of active tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        <h2 style={{ fontSize: 'var(--fs-h4)', fontWeight: 800 }}>Active Homework</h2>

        {assignments.length === 0 ? (
          <Card style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
            <ClipboardList size={48} color="var(--color-text-tertiary)" style={{ margin: '0 auto var(--sp-3) auto' }} />
            <h3 style={{ fontWeight: 800 }}>No Homework Assigned</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Class has completed all tasks. Assign new work using the button.</p>
          </Card>
        ) : (
          assignments.map((assignment) => {
            const chName = dbChapters.find(c => c.id === assignment.chapterId)?.title || 'General';

            return (
              <Card key={assignment.id} style={{ padding: 'var(--sp-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: 'var(--fs-body)' }}>{assignment.title}</h3>
                    <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-secondary)' }}>
                      Concept: {chName} • {assignment.questions.length} questions
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteAssignment(assignment.id)}>
                    <Trash size={14} color="var(--color-error)" />
                  </Button>
                </div>

                <p style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-4)', whiteSpace: 'pre-wrap' }}>
                  {assignment.description}
                </p>

                <div style={{ display: 'flex', gap: 'var(--sp-4)', fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--sp-3)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                    <Calendar size={12} /> Due: {assignment.dueDate || 'No Limit'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                    <Users size={12} /> Class: Grade 7A
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', color: 'var(--color-success)', fontWeight: 'var(--fw-bold)', marginLeft: 'auto' }}>
                    <CheckCircle2 size={12} /> Active
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
