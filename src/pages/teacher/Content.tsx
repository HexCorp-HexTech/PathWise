/* ============================================
   VIDYA AI — Teacher Content Manager & Syllabus Importer
   ============================================ */
import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, ChevronRight, ArrowLeft, Plus, Check, AlertCircle, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { db } from '../../lib/db';
import { generateNotes, translateContentToHindi } from '../../lib/ai-engine';
import type { Subject, Chapter, Board } from '../../types';

export const ContentPage: React.FC = () => {
  // Curriculum states
  const [dbSubjects, setDbSubjects] = useState<Subject[]>([]);
  const [dbChapters, setDbChapters] = useState<Chapter[]>([]);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [activeNotes, setActiveNotes] = useState<string | null>(null);

  // Importer states
  const [showImporter, setShowImporter] = useState(false);
  const [board, setBoard] = useState<Board>('CBSE');
  const [grade, setGrade] = useState<number>(10);
  const [importUrl, setImportUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [parsedSyllabus, setParsedSyllabus] = useState<any>(null);
  const [selectedChapters, setSelectedChapters] = useState<Record<string, boolean>>({});

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
        console.error('Failed to load curriculum in ContentPage', err);
      }
    };
    fetchCurriculum();
  }, []);

  const filteredChapters = dbChapters.filter(c => c.subjectId === selectedSubject);

  const handleViewNotes = async (chapterId: string, title: string) => {
    setSelectedChapter(chapterId);
    const chapterObj = dbChapters.find(c => c.id === chapterId);
    const subjectObj = dbSubjects.find(s => s.id === (chapterObj?.subjectId || selectedSubject));
    const subjectName = subjectObj?.name;
    try {
      const notesRecord = await db.notes.where('chapterId').equals(chapterId).first();
      if (notesRecord) {
        setActiveNotes(notesRecord.content);
      } else {
        const notes = generateNotes(chapterId, title, 'en', subjectName);
        setActiveNotes(notes.content);
      }
    } catch (e) {
      const notes = generateNotes(chapterId, title, 'en', subjectName);
      setActiveNotes(notes.content);
    }
  };

  const handleGenerateRevision = () => {
    if (!selectedChapter) return;
    const currentTitle = dbChapters.find(c => c.id === selectedChapter)?.title || '';
    const newNotes = `# Revision Notes: ${currentTitle}\n\nThis is an AI generated revision packet covering core principles of ${currentTitle.toLowerCase()}.\n\n## Core Summaries\n- Key definitions are highlighted.\n- Quick recall tips added.\n- Self-test options enabled.`;
    setActiveNotes(newNotes);
  };

  // Helper functions for mapping icons and colors to subject names
  const getSubjectIcon = (name: string): string => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('math') || lowercaseName.includes('algebra') || lowercaseName.includes('geometry')) return 'calculator';
    if (lowercaseName.includes('physics') || lowercaseName.includes('electricity') || lowercaseName.includes('force')) return 'zap';
    if (lowercaseName.includes('chem') || lowercaseName.includes('acid') || lowercaseName.includes('reaction')) return 'flask-conical';
    if (lowercaseName.includes('bio') || lowercaseName.includes('life') || lowercaseName.includes('cell') || lowercaseName.includes('nutrition')) return 'heart';
    if (lowercaseName.includes('science')) return 'flask-conical';
    if (lowercaseName.includes('english') || lowercaseName.includes('grammar') || lowercaseName.includes('literature')) return 'book-open';
    if (lowercaseName.includes('social') || lowercaseName.includes('history') || lowercaseName.includes('geo') || lowercaseName.includes('civic')) return 'globe-2';
    return 'book-open';
  };

  const getSubjectColor = (name: string): string => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('math') || lowercaseName.includes('algebra') || lowercaseName.includes('geometry')) return '#FF6B6B';
    if (lowercaseName.includes('physics')) return '#FF8C42';
    if (lowercaseName.includes('chem')) return '#4ECDC4';
    if (lowercaseName.includes('bio')) return '#82E0AA';
    if (lowercaseName.includes('science')) return '#4ECDC4';
    if (lowercaseName.includes('english')) return '#45B7D1';
    return '#BB8FCE';
  };

  // Fetch and Parse API Handlers
  const handleFetchAndParseSyllabus = async () => {
    if (!importUrl.trim() && !rawText.trim()) {
      alert("Please provide a website URL or paste raw syllabus text first.");
      return;
    }

    setIsFetching(true);
    setParsedSyllabus(null);
    try {
      let syllabusText = rawText;

      // If URL provided, fetch text via server proxy
      if (importUrl.trim()) {
        const fetchRes = await fetch('/api/fetch-syllabus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: importUrl.trim() })
        });
        if (!fetchRes.ok) {
          const errData = await fetchRes.json();
          throw new Error(errData.error || 'Failed to fetch syllabus from URL.');
        }
        const fetchJson = await fetchRes.json();
        syllabusText = fetchJson.text;
      }

      // Send to parser endpoint
      const parseRes = await fetch('/api/parse-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board,
          grade: Number(grade),
          text: syllabusText
        })
      });

      if (!parseRes.ok) {
        throw new Error('Failed to parse syllabus text.');
      }

      const parsedData = await parseRes.json();
      setParsedSyllabus(parsedData);

      // Pre-select all chapters
      const selectMap: Record<string, boolean> = {};
      parsedData.subjects?.forEach((subj: any) => {
        const subjSuffix = subj.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const boardPrefix = board.toLowerCase();
        const subjectId = `${boardPrefix}-${grade}-${subjSuffix}`;
        
        subj.chapters?.forEach((ch: any) => {
          const chapterKey = `${subjectId}-ch-${ch.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          selectMap[chapterKey] = true;
        });
      });
      setSelectedChapters(selectMap);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error processing syllabus.');
    } finally {
      setIsFetching(false);
    }
  };

  // Save parsed subjects and chapters to DB
  const handleImportCurriculum = async () => {
    if (!parsedSyllabus || !parsedSyllabus.subjects) return;

    setIsFetching(true);
    try {
      let subjectsCount = await db.subjects.count();

      for (const parsedSubj of parsedSyllabus.subjects) {
        const cleanSubjName = parsedSubj.name.trim();
        const suffix = cleanSubjName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const boardPrefix = board.toLowerCase();
        const subjectId = `${boardPrefix}-${grade}-${suffix}`;

        // Save Subject
        const subjectRecord: Subject = {
          id: subjectId,
          name: cleanSubjName,
          nameHi: translateContentToHindi(cleanSubjName),
          icon: getSubjectIcon(cleanSubjName),
          color: getSubjectColor(cleanSubjName),
          grade: Number(grade),
          board: board,
          sortOrder: ++subjectsCount
        };
        await db.subjects.put(subjectRecord);

        // Save Chapters
        if (parsedSubj.chapters) {
          let chIdx = 0;
          for (const ch of parsedSubj.chapters) {
            const chapterKey = `${subjectId}-ch-${ch.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

            // Check if selected
            if (selectedChapters[chapterKey] !== false) {
              const chapterRecord: Chapter = {
                id: chapterKey,
                subjectId: subjectId,
                title: ch.title,
                titleHi: translateContentToHindi(ch.title),
                description: ch.description || '',
                sortOrder: ++chIdx,
                estimatedTimeMin: Number(ch.estimatedTimeMin) || 60,
                difficulty: Number(ch.difficulty) || 0.5,
                prerequisites: [],
                learningObjectives: ch.learningObjectives || [],
                isAvailableOffline: true
              };
              await db.chapters.put(chapterRecord);
            }
          }
        }
      }

      alert("Curriculum syllabus imported successfully! Note: dynamic AI contents will be compiled and cached on first load.");

      // Reload lists
      const subjs = await db.subjects.toArray();
      const chaps = await db.chapters.toArray();
      setDbSubjects(subjs);
      setDbChapters(chaps);

      if (subjs.length > 0) {
        setSelectedSubject(subjs[0].id);
      }

      setShowImporter(false);
      setParsedSyllabus(null);
    } catch (err) {
      console.error('Failed to import curriculum', err);
      alert('Error saving curriculum to database.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleToggleChapter = (key: string) => {
    setSelectedChapters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!window.confirm("Are you sure you want to delete this subject and all its chapters? This action is permanent.")) return;
    try {
      await db.chapters.where('subjectId').equals(subjectId).delete();
      await db.subjects.delete(subjectId);
      
      const subjs = await db.subjects.toArray();
      const chaps = await db.chapters.toArray();
      setDbSubjects(subjs);
      setDbChapters(chaps);
      if (subjs.length > 0) {
        setSelectedSubject(subjs[0].id);
      } else {
        setSelectedSubject('');
      }
    } catch (err) {
      console.error('Failed to delete subject', err);
    }
  };

  return (
    <div className="tdash" style={{ maxWidth: '950px', margin: '0 auto', padding: 'var(--sp-6)' }}>
      {selectedChapter ? (
        /* 1. View Note State */
        <div>
          <button className="doubt-detail__back" onClick={() => { setSelectedChapter(null); setActiveNotes(null); }} style={{ marginBottom: 'var(--sp-4)' }}>
            <ArrowLeft size={16} /> Back to Chapters
          </button>

          <Card style={{ padding: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--fs-h3)', fontWeight: 800 }}>
                  {dbChapters.find(c => c.id === selectedChapter)?.title}
                </h2>
                <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-secondary)' }}>Resource Package</span>
              </div>
              <Button variant="primary" icon={Sparkles} onClick={handleGenerateRevision}>
                Re-Generate with AI
              </Button>
            </div>

            <div style={{ background: 'var(--color-surface-bg)', padding: 'var(--sp-6)', borderRadius: 'var(--radius-md)', whiteSpace: 'pre-line', fontSize: 'var(--fs-body-sm)', lineHeight: '1.6', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', maxHeight: '500px', overflowY: 'auto' }}>
              {activeNotes}
            </div>
          </Card>
        </div>
      ) : showImporter ? (
        /* 2. Syllabus Importer Form State */
        <div>
          <button className="doubt-detail__back" onClick={() => { setShowImporter(false); setParsedSyllabus(null); }} style={{ marginBottom: 'var(--sp-4)' }}>
            <ArrowLeft size={16} /> Back to Outline
          </button>

          <div style={{ marginBottom: 'var(--sp-6)' }}>
            <h1 style={{ fontSize: 'var(--fs-h2)', fontWeight: 800 }}>Import Syllabus</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>Fetch and parse an official syllabus website or document to dynamically construct curriculum subjects and chapters.</p>
          </div>

          <Card style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
            <h3 style={{ fontSize: 'var(--fs-h4)', fontWeight: 'bold', marginBottom: 'var(--sp-4)' }}>Syllabus Configuration</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--fs-caption)', fontWeight: 'bold', marginBottom: 'var(--sp-1)' }}>BOARD</label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value as Board)}
                  style={{ width: '100%', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface-bg)', color: 'var(--color-text-primary)' }}
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="STATE_MH">Maharashtra State Board</option>
                  <option value="STATE_UP">UP State Board</option>
                  <option value="STATE_TN">Tamil Nadu State Board</option>
                  <option value="STATE_KA">Karnataka State Board</option>
                  <option value="STATE_AP">Andhra Pradesh State Board</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--fs-caption)', fontWeight: 'bold', marginBottom: 'var(--sp-1)' }}>GRADE / CLASS</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  style={{ width: '100%', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface-bg)', color: 'var(--color-text-primary)' }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
                    <option key={g} value={g}>Class {g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <label style={{ display: 'block', fontSize: 'var(--fs-caption)', fontWeight: 'bold', marginBottom: 'var(--sp-1)' }}>SYLLABUS URL (CORS BYPASS ENABLED)</label>
              <input
                type="text"
                placeholder="https://example-board.gov.in/syllabus-class-10"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                style={{ width: '100%', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface-bg)', color: 'var(--color-text-primary)' }}
              />
            </div>

            <div style={{ marginBottom: 'var(--sp-6)' }}>
              <label style={{ display: 'block', fontSize: 'var(--fs-caption)', fontWeight: 'bold', marginBottom: 'var(--sp-1)' }}>OR PASTE RAW SYLLABUS TEXT</label>
              <textarea
                rows={6}
                placeholder="Paste structural topics, chapters and definitions..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                style={{ width: '100%', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface-bg)', color: 'var(--color-text-primary)', resize: 'vertical' }}
              />
            </div>

            <Button
              variant="primary"
              onClick={handleFetchAndParseSyllabus}
              disabled={isFetching}
              icon={isFetching ? undefined : Sparkles}
              style={{ width: '100%' }}
            >
              {isFetching ? 'Parsing Syllabus...' : 'Analyze & Extract Curriculum'}
            </Button>
          </Card>

          {/* Parse Preview */}
          {parsedSyllabus && parsedSyllabus.subjects && (
            <Card style={{ padding: 'var(--sp-6)' }} className="animate-fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--fs-h4)', fontWeight: 'bold' }}>Curriculum Preview</h3>
                  <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-secondary)' }}>Select chapters to import into Grade {grade} ({board})</p>
                </div>
                <Button variant="primary" icon={Check} onClick={handleImportCurriculum}>
                  Import Selected Curriculum
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
                {parsedSyllabus.subjects.map((subj: any, sIdx: number) => {
                  const subjSuffix = subj.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                  const boardPrefix = board.toLowerCase();
                  const subjectId = `${boardPrefix}-${grade}-${subjSuffix}`;

                  return (
                    <div key={sIdx} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--sp-4)' }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: 'var(--sp-3)' }}>
                        <BookOpen size={16} /> {subj.name}
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                        {subj.chapters?.map((ch: any, cIdx: number) => {
                          const chapterKey = `${subjectId}-ch-${ch.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                          const isChecked = selectedChapters[chapterKey] !== false;

                          return (
                            <div
                              key={cIdx}
                              onClick={() => handleToggleChapter(chapterKey)}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 'var(--sp-3)',
                                padding: 'var(--sp-3)',
                                borderRadius: 'var(--radius-sm)',
                                background: isChecked ? 'rgba(78, 205, 196, 0.05)' : 'transparent',
                                border: '1px solid var(--color-border)',
                                cursor: 'pointer'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // Controlled click on container
                                style={{ marginTop: '3px', cursor: 'pointer' }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: 'bold', fontSize: 'var(--fs-body-sm)' }}>{ch.title}</span>
                                  <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)' }}>{ch.estimatedTimeMin || 45} mins</span>
                                </div>
                                <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-1)' }}>
                                  {ch.description || 'No description provided.'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* 3. Course Outline View State */
        <div>
          {/* Header */}
          <div className="tdash__header" style={{ marginBottom: 'var(--sp-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)', fontWeight: 'var(--fw-bold)', textTransform: 'uppercase' }}>Resources</span>
              <h1 style={{ fontSize: 'var(--fs-h2)', fontWeight: 800 }}>Content Manager</h1>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setShowImporter(true)}>
              Import Syllabus
            </Button>
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)', overflowX: 'auto', paddingBottom: 'var(--sp-2)' }}>
            {dbSubjects.map(subj => (
              <div key={subj.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <button
                  onClick={() => setSelectedSubject(subj.id)}
                  style={{
                    padding: 'var(--sp-2) var(--sp-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: selectedSubject === subj.id ? 'var(--color-primary)' : 'var(--color-surface-card)',
                    color: selectedSubject === subj.id ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                    fontWeight: 'var(--fw-bold)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-fast) var(--ease-out)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {subj.name} (Class {subj.grade} {subj.board})
                </button>
                {selectedSubject === subj.id && (
                  <button
                    onClick={() => handleDeleteSubject(subj.id)}
                    title="Delete Subject"
                    style={{
                      padding: 'var(--sp-2)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-error)',
                      background: 'rgba(217, 48, 37, 0.1)',
                      color: 'var(--color-error)',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--sp-4)' }}>
            <h2 style={{ fontSize: 'var(--fs-h4)', fontWeight: 800 }}>Course Outline & Notes</h2>
            {filteredChapters.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-10)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <AlertCircle size={32} style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--sp-2)' }} />
                <p style={{ color: 'var(--color-text-secondary)' }}>No chapters added to this subject outline yet.</p>
              </div>
            ) : (
              filteredChapters.map((chapter) => (
                <Card
                  key={chapter.id}
                  variant="interactive"
                  style={{ padding: 'var(--sp-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => handleViewNotes(chapter.id, chapter.title)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                    <div style={{ padding: 'var(--sp-2)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-sm)' }}>
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-body-sm)' }}>{chapter.title}</h3>
                      <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-secondary)' }}>{chapter.description}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--color-text-tertiary)" />
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
