/* ============================================
   VIDYA AI — Teacher Analytics Dashboard
   ============================================ */
import React from 'react';
import { BarChart3, TrendingUp, Clock, AlertTriangle, Brain } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/Progress';
import { db } from '../../lib/db';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
import { computeStudentMastery } from '../../lib/compute-mastery';

export const AnalyticsPage: React.FC = () => {
  const { teacherProfile } = useAuthStore();
  const activeCode = teacherProfile?.activeClassroomCode || '';
  const [classroomStudents, setClassroomStudents] = useState<{ id: string; name: string; avatarId: string; mastery: number; streak: number; riskLevel: 'low' | 'medium' | 'high'; classCode: string }[]>([]);
  const [subjectAverages, setSubjectAverages] = useState<{ name: string; score: number; color: string; studentsStruggling: number }[]>([]);
  const [urgentConcepts, setUrgentConcepts] = useState<{ name: string; subject: string; avgScore: number; studentsAtRisk: number }[]>([]);
  const [weeklyStudyHrs, setWeeklyStudyHrs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassStudents = async () => {
      if (!activeCode) {
        setClassroomStudents([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const profiles = await db.studentProfiles.toArray();
        const classProfiles = profiles.filter(p => p.classCode === activeCode);

        const studentsList: { id: string; name: string; avatarId: string; mastery: number; streak: number; riskLevel: 'low' | 'medium' | 'high'; classCode: string }[] = [];
        for (const cp of classProfiles) {
          const userRec = await db.users.get(cp.userId);
          if (userRec) {
            const mastery = await computeStudentMastery(cp.userId);
            const riskLevel = mastery >= 0.7 ? 'low' : mastery >= 0.5 ? 'medium' : 'high';
            studentsList.push({
              id: cp.userId,
              name: userRec.name,
              avatarId: userRec.avatarId || 'owl',
              mastery,
              streak: cp.streakCurrent || 0,
              riskLevel: riskLevel as 'low' | 'medium' | 'high',
              classCode: activeCode
            });
          }
        }
        setClassroomStudents(studentsList);

        // ── Compute real subject averages from quiz attempts & BKT ──────────
        const allSubjects = await db.subjects.toArray();
        const studentIds = studentsList.map(s => s.id);
        const computedSubjectAvgs: { name: string; score: number; color: string; studentsStruggling: number }[] = [];

        for (const subj of allSubjects) {
          const chapters = await db.chapters.where('subjectId').equals(subj.id).toArray();
          if (chapters.length === 0) continue;

          let totalScore = 0;
          let totalCount = 0;
          let studentsStruggling = 0;

          for (const st of studentIds) {
            let studentSubjScore = 0;
            let studentChapCount = 0;
            for (const ch of chapters) {
              // Use BKT mastery first, fall back to quiz attempt score
              const bktRecords = await db.bktMastery
                .where('userId').equals(st)
                .and(r => r.chapterId === ch.id)
                .toArray();
              if (bktRecords.length > 0) {
                const avgBkt = bktRecords.reduce((s, r) => s + r.pKnow, 0) / bktRecords.length;
                studentSubjScore += avgBkt * 100;
                studentChapCount++;
              } else {
                const attempts = await db.quizAttempts
                  .where('userId').equals(st)
                  .and(a => a.chapterId === ch.id)
                  .toArray();
                if (attempts.length > 0) {
                  const maxScore = Math.max(...attempts.map(a => {
                    const sc = a.score ?? 0;
                    return sc > 1 ? sc : sc * 100;
                  }));
                  studentSubjScore += maxScore;
                  studentChapCount++;
                }
              }
            }
            if (studentChapCount > 0) {
              const avg = studentSubjScore / studentChapCount;
              totalScore += avg;
              totalCount++;
              if (avg < 60) studentsStruggling++;
            }
          }

          if (totalCount > 0) {
            computedSubjectAvgs.push({
              name: subj.name,
              score: Math.round(totalScore / totalCount),
              color: subj.color || '#4ECDC4',
              studentsStruggling
            });
          }
        }
        // Sort descending score, cap to 6 subjects
        computedSubjectAvgs.sort((a, b) => b.score - a.score);
        setSubjectAverages(computedSubjectAvgs.slice(0, 6));

        // ── Compute urgent concepts (chapters with lowest avg BKT mastery) ──
        const allChapters = await db.chapters.toArray();
        const chapterScores: { name: string; subject: string; avgScore: number; studentsAtRisk: number }[] = [];

        for (const ch of allChapters) {
          const subj = allSubjects.find(s => s.id === ch.subjectId);
          if (!subj) continue;
          let total = 0;
          let count = 0;
          let atRisk = 0;
          for (const st of studentIds) {
            const bkt = await db.bktMastery
              .where('userId').equals(st)
              .and(r => r.chapterId === ch.id)
              .toArray();
            if (bkt.length > 0) {
              const avg = bkt.reduce((s, r) => s + r.pKnow, 0) / bkt.length * 100;
              total += avg;
              count++;
              if (avg < 60) atRisk++;
            }
          }
          if (count > 0) {
            chapterScores.push({
              name: ch.title,
              subject: subj.name,
              avgScore: Math.round(total / count),
              studentsAtRisk: atRisk
            });
          }
        }
        // Pick chapters with lowest average mastery
        chapterScores.sort((a, b) => a.avgScore - b.avgScore);
        setUrgentConcepts(chapterScores.slice(0, 5).filter(c => c.avgScore < 75));

        // ── Compute weekly study hours from real study sessions ─────────────
        const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
        let totalSecs = 0;
        for (const st of studentIds) {
          const sessions = await db.studySessions.where('userId').equals(st).toArray();
          const weekSessions = sessions.filter(s => (s.startedAt || 0) > weekAgo);
          totalSecs += weekSessions.reduce((sum, s) => sum + (s.durationSec || 0), 0);
        }
        setWeeklyStudyHrs(Math.round((totalSecs / 3600) * 10) / 10);

      } catch (err) {
        console.error('Failed to load students in analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassStudents();
  }, [activeCode]);

  // Aggregate stats
  const totalStudents = classroomStudents.length;
  const averageMastery = totalStudents > 0 ? Math.round(classroomStudents.reduce((s, st) => s + st.mastery, 0) / totalStudents * 100) : 0;
  const highRiskStudents = classroomStudents.filter(s => s.riskLevel === 'high');
  const mediumRiskStudents = classroomStudents.filter(s => s.riskLevel === 'medium');

  if (loading) {
    return (
      <div className="tdash" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
        <p>Loading analytics data...</p>
      </div>
    );
  }



  return (
    <div className="tdash" style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--sp-6)' }}>
      {/* Header */}
      <div className="tdash__header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)', fontWeight: 'var(--fw-bold)', textTransform: 'uppercase' }}>Class Analytics</span>
          <h1 style={{ fontSize: 'var(--fs-h2)', fontWeight: 800 }}>Performance & Metrics</h1>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <Card style={{ padding: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-2)' }}>
            <span style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-bold)' }}>Class Avg Mastery</span>
            <TrendingUp size={16} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: 'var(--fs-h2)', fontWeight: 800, color: 'var(--color-text-primary)' }}>{averageMastery}%</div>
          <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)', marginTop: 'var(--sp-1)' }}>+2.4% from last week</p>
        </Card>

        <Card style={{ padding: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-2)' }}>
            <span style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-bold)' }}>Weekly Study Hours</span>
            <Clock size={16} color="#4ECDC4" />
          </div>
          <div style={{ fontSize: 'var(--fs-h2)', fontWeight: 800, color: 'var(--color-text-primary)' }}>{weeklyStudyHrs} hrs</div>
          <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)', marginTop: 'var(--sp-1)' }}>Across {classroomStudents.length} students this week</p>
        </Card>

        <Card style={{ padding: 'var(--sp-5)', borderLeft: '4px solid var(--color-error)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-2)' }}>
            <span style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-bold)' }}>At Risk Students</span>
            <AlertTriangle size={16} color="var(--color-error)" />
          </div>
          <div style={{ fontSize: 'var(--fs-h2)', fontWeight: 800, color: 'var(--color-error)' }}>{highRiskStudents.length}</div>
          <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)', marginTop: 'var(--sp-1)' }}>Needs immediate guidance</p>
        </Card>
      </div>

      {/* Subject Mastery Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <Card style={{ padding: 'var(--sp-6)' }}>
          <h3 style={{ fontSize: 'var(--fs-h4)', fontWeight: 800, marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <BarChart3 size={18} /> Subject Averages
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            {subjectAverages.map(subject => (
              <div key={subject.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-body-sm)', marginBottom: 'var(--sp-1.5)', fontWeight: 'var(--fw-bold)' }}>
                  <span>{subject.name}</span>
                  <span style={{ color: subject.score < 70 ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
                    {subject.score}% Avg
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ flex: 1 }}>
                    <ProgressBar value={subject.score} color={subject.color} size="sm" />
                  </div>
                  <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-secondary)', width: '120px', textAlign: 'right' }}>
                    {subject.studentsStruggling > 0 ? `${subject.studentsStruggling} students struggling` : 'No major struggle'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)' }}>
        {/* Urgent Concepts */}
        <Card style={{ padding: 'var(--sp-6)' }}>
          <h3 style={{ fontSize: 'var(--fs-h4)', fontWeight: 800, marginBottom: 'var(--sp-4)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Brain size={18} /> Urgent Review Needed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {urgentConcepts.map((concept, i) => (
              <div key={i} style={{ padding: 'var(--sp-4)', background: 'var(--color-surface-bg)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-body-sm)', marginBottom: 'var(--sp-1)' }}>
                  <span>{concept.name}</span>
                  <span style={{ color: 'var(--color-error)' }}>{concept.avgScore}% Mastery</span>
                </div>
                <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-secondary)' }}>
                  Subject: {concept.subject} • {concept.studentsAtRisk} students struggling
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* High Risk Details */}
        <Card style={{ padding: 'var(--sp-6)' }}>
          <h3 style={{ fontSize: 'var(--fs-h4)', fontWeight: 800, marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <AlertTriangle size={18} color="var(--color-error)" /> High Risk Interventions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {highRiskStudents.map((student, i) => (
              <div key={i} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: 'var(--sp-3)', background: 'rgba(217, 48, 37, 0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-body-sm)' }}>{student.name}</div>
                  <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)' }}>Mastery: {Math.round(student.mastery * 100)}% • Streak: {student.streak} days</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--fs-caption)', padding: 'var(--sp-1) var(--sp-2)', background: 'var(--color-error-light)', color: 'var(--color-error)', fontWeight: 'var(--fw-bold)', borderRadius: 'var(--radius-sm)' }}>
                    High Risk
                  </span>
                </div>
              </div>
            ))}
            {mediumRiskStudents.slice(0, 1).map((student, i) => (
              <div key={i} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: 'var(--sp-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-body-sm)' }}>{student.name}</div>
                  <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)' }}>Mastery: {Math.round(student.mastery * 100)}% • Streak: {student.streak} days</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--fs-caption)', padding: 'var(--sp-1) var(--sp-2)', background: 'var(--color-warning-light)', color: 'var(--color-warning)', fontWeight: 'var(--fw-bold)', borderRadius: 'var(--radius-sm)' }}>
                    Medium Risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
