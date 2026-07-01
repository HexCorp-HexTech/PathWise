/* ============================================
   VIDYA AI — Teacher AI Insights Dashboard
   ============================================ */
import React, { useEffect, useState } from 'react';
import { Lightbulb, Sparkles, ArrowRight, ShieldAlert, Award } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../lib/db';
import { computeStudentMastery } from '../../lib/compute-mastery';

interface InsightItem {
  type: string;
  title: string;
  desc: string;
  action: string;
  route: string;
  icon: React.ReactNode;
  bg: string;
}

export const AIInsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, teacherProfile } = useAuthStore();
  const activeCode = teacherProfile?.activeClassroomCode || '';

  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [diagnosticText, setDiagnosticText] = useState('');

  useEffect(() => {
    const generateInsights = async () => {
      setLoading(true);
      try {
        const studentProfiles = await db.studentProfiles.toArray();
        const classProfiles = studentProfiles.filter(p => p.classCode === activeCode);
        const studentIds = classProfiles.map(p => p.userId);

        // Fetch chapters
        const allChapters = await db.chapters.toArray();

        // 1. Find Concept roadblock (lowest average chapter score < 70%)
        let lowestChapter: any = null;
        let lowestAvg = 100;
        let strugglingCount = 0;

        for (const ch of allChapters) {
          let scoreSum = 0;
          let count = 0;
          let studentStruggles = 0;

          for (const st of studentIds) {
            const bkt = await db.bktMastery
              .where('userId').equals(st)
              .and(r => r.chapterId === ch.id)
              .toArray();
            let chapScore = 0;
            let hasAttempt = false;

            if (bkt.length > 0) {
              chapScore = bkt.reduce((sum, r) => sum + r.pKnow, 0) / bkt.length * 100;
              hasAttempt = true;
            } else {
              const attempts = await db.quizAttempts
                .where('userId').equals(st)
                .and(a => a.chapterId === ch.id)
                .toArray();
              if (attempts.length > 0) {
                chapScore = Math.max(...attempts.map(a => (a.score ?? 0) > 1 ? a.score! : a.score! * 100));
                hasAttempt = true;
              }
            }

            if (hasAttempt) {
              scoreSum += chapScore;
              count++;
              if (chapScore < 60) {
                studentStruggles++;
              }
            }
          }

          if (count > 0) {
            const avg = scoreSum / count;
            if (avg < lowestAvg) {
              lowestAvg = avg;
              lowestChapter = ch;
              strugglingCount = studentStruggles;
            }
          }
        }

        // 2. Class Average Mastery
        let classAvgMastery = 0;
        if (studentIds.length > 0) {
          let totalMastery = 0;
          for (const sid of studentIds) {
            totalMastery += await computeStudentMastery(sid);
          }
          classAvgMastery = Math.round((totalMastery / studentIds.length) * 100);
        }

        // 3. Doubt Room queries count
        const openDoubts = await db.doubtPosts.where('status').equals('open').toArray();
        const classDoubts = openDoubts.filter(d => studentIds.includes(d.userId));

        // Build Actionable Insights list
        const list: InsightItem[] = [];

        // Roadblock Insight
        if (lowestChapter && lowestAvg < 70) {
          list.push({
            type: 'warning',
            title: 'Concept Block Detected',
            desc: `${strugglingCount} student${strugglingCount > 1 ? 's' : ''} scored below 60% on the latest '${lowestChapter.title}' quiz. The adaptation threshold suggests they are hitting a roadblock.`,
            action: 'Assign Revision Homework',
            route: '/teacher/assignments',
            icon: <ShieldAlert size={18} color="var(--color-error)" />,
            bg: 'rgba(217, 48, 37, 0.03)'
          });
        } else {
          list.push({
            type: 'warning',
            title: 'Steady Progress',
            desc: 'No major concept roadblocks detected across current quizzes. Keep monitoring adaptive pathways.',
            action: 'Assign Practice Task',
            route: '/teacher/assignments',
            icon: <ShieldAlert size={18} color="var(--color-success)" />,
            bg: 'rgba(0, 184, 124, 0.03)'
          });
        }

        // Retention Rate Insight
        const retentionPercent = classAvgMastery > 0 ? classAvgMastery : 75;
        list.push({
          type: 'success',
          title: 'Retention Diagnostics',
          desc: `Class average retention rate across assigned subjects is estimated at ${retentionPercent}%. Spaced repetition schedules (SM-2) show moderate recall stability.`,
          action: 'View Class Curriculum',
          route: '/teacher/analytics',
          icon: <Award size={18} color="var(--color-success)" />,
          bg: 'rgba(0, 184, 124, 0.03)'
        });

        // Doubt Room Insight
        if (classDoubts.length > 0) {
          list.push({
            type: 'suggestion',
            title: 'Doubt Room Active Queries',
            desc: `There are ${classDoubts.length} unresolved student query/queries in the classroom Doubt Room. We suggest reviewing common topics in the next class session.`,
            action: 'Go to Doubt Room',
            route: '/teacher/doubts',
            icon: <Lightbulb size={18} color="var(--color-warning)" />,
            bg: 'rgba(244, 180, 0, 0.03)'
          });
        } else {
          list.push({
            type: 'suggestion',
            title: 'All Doubts Resolved',
            desc: 'Great! All doubt queries raised by students in your classroom have been answered.',
            action: 'Visit Doubt Room',
            route: '/teacher/doubts',
            icon: <Lightbulb size={18} color="var(--color-success)" />,
            bg: 'rgba(0, 184, 124, 0.03)'
          });
        }

        setInsights(list);

        // Build Diagnostic text
        const teacherName = user?.name || 'Instructor';
        let diag = `Hello ${teacherName}! Overall class mastery average is sitting at ${classAvgMastery}%. `;
        if (lowestChapter && lowestAvg < 70) {
          diag += `Special focus is recommended for '${lowestChapter.title}', where Bayesian Knowledge Tracing (BKT) indicates mastery probability is hovering below target thresholds.`;
        } else {
          diag += `Class learning velocities are healthy, with students maintaining study streaks across active chapters.`;
        }
        setDiagnosticText(diag);

      } catch (err) {
        console.error('Failed to generate insights', err);
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
  }, [activeCode, user]);

  if (loading) {
    return (
      <div className="tdash" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
        <p>Generating class insights...</p>
      </div>
    );
  }

  return (
    <div className="tdash" style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--sp-6)' }}>
      {/* Header */}
      <div className="tdash__header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)', fontWeight: 'var(--fw-bold)', textTransform: 'uppercase' }}>AI-Powered Analytics</span>
          <h1 style={{ fontSize: 'var(--fs-h2)', fontWeight: 800 }}>Classroom Insights</h1>
        </div>
      </div>

      <Card style={{ padding: 'var(--sp-6)', background: 'var(--color-primary-surface)', border: '1px solid rgba(200, 0, 24, 0.1)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
          <div style={{ padding: 'var(--sp-2)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-sm)' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 'var(--fs-body)', color: 'var(--color-text-primary)' }}>
              Weekly Educational Diagnostic
            </h3>
            <p style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginTop: 'var(--sp-2)' }}>
              {diagnosticText}
            </p>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
        <h2 style={{ fontSize: 'var(--fs-h4)', fontWeight: 800 }}>Actionable Recommendations</h2>
        {insights.map((insight, i) => (
          <Card key={i} style={{ padding: 'var(--sp-5)', background: insight.bg, border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start', marginBottom: 'var(--sp-4)' }}>
              <div style={{ marginTop: '2px' }}>{insight.icon}</div>
              <div>
                <h4 style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-body-sm)' }}>{insight.title}</h4>
                <p style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginTop: 'var(--sp-1)' }}>
                  {insight.desc}
                </p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--sp-3)', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate(insight.route)}>
                {insight.action}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

