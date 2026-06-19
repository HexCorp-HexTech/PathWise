/* ============================================
   VIDYA AI — Parent's Weekly Report View
   ============================================ */
import React, { useEffect, useState } from 'react';
import {
  Share2, Award, Clock, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { db } from '../../lib/db';
import { DEMO_STUDENT } from '../../data/seed';
import type { User, StudentProfile } from '../../types';

interface SubjectProgressItem {
  name: string;
  mastery: number;
  color: string;
}

export const WeeklyReportPage: React.FC = () => {
  const [childUser, setChildUser] = useState<User | null>(null);
  const [childProfile, setChildProfile] = useState<StudentProfile | null>(null);
  const [subjectsProgress, setSubjectsProgress] = useState<SubjectProgressItem[]>([]);
  const [totalStudyMins, setTotalStudyMins] = useState(0);
  const [finishedQuizzes, setFinishedQuizzes] = useState(0);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [dailyStudy, setDailyStudy] = useState<{ day: string; minutes: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildProgress = async () => {
      setLoading(true);
      const childId = localStorage.getItem('parent_active_child_id') || 'student-aarav-001';
      try {
        const u = await db.users.get(childId);
        const p = await db.studentProfiles.get(childId);
        
        const activeUser = u || DEMO_STUDENT.user;
        const activeProfile = p || DEMO_STUDENT.profile;

        setChildUser(activeUser);
        setChildProfile(activeProfile);

        // Fetch subjects & masteries
        const dbSubjects = await db.subjects
          .where('board')
          .equals(activeProfile.board)
          .toArray();

        const gradeSubjects = dbSubjects.filter(s => Number(s.grade) === Number(activeProfile.grade));
        const progressList: SubjectProgressItem[] = [];
        const strengthsList: string[] = [];
        const weaknessesList: string[] = [];

        for (const subj of gradeSubjects) {
          const chaps = await db.chapters.where('subjectId').equals(subj.id).toArray();
          let sumMastery = 0;
          
          for (const ch of chaps) {
            const attempts = await db.quizAttempts
              .where('userId')
              .equals(activeUser.id)
              .and(att => att.chapterId === ch.id)
              .toArray();
            
            const maxScore = attempts.length > 0 ? Math.max(...attempts.map(a => {
              const s = a.score ?? 0;
              return s > 1 ? s / 100 : s;
            })) : 0;
            const bktRecord = await db.bktMastery
              .where('[userId+chapterId+skillId]')
              .equals([activeUser.id, ch.id, ch.id])
              .first();

            sumMastery += bktRecord ? bktRecord.pKnow : maxScore;
          }

          const avgMastery = chaps.length > 0 ? sumMastery / chaps.length : 0;
          const percentage = Math.round(avgMastery * 100);

          progressList.push({
            name: subj.name,
            mastery: percentage,
            color: subj.color || '#4ECDC4'
          });

          if (percentage >= 75) {
            strengthsList.push(`${subj.name} (${percentage}% mastery)`);
          } else if (percentage > 0 && percentage < 70) {
            weaknessesList.push(`${subj.name} (${percentage}% mastery)`);
          }
        }

        setSubjectsProgress(progressList);
        setStrengths(strengthsList);
        setWeaknesses(weaknessesList);

        // Fetch study sessions and quizzes finished
        const studySessions = await db.studySessions.where('userId').equals(activeUser.id).toArray();
        const totalDuration = studySessions.reduce((sum, s) => sum + (s.durationSec || 0), 0);
        setTotalStudyMins(Math.round(totalDuration / 60));

        const attemptsCount = await db.quizAttempts.where('userId').equals(activeUser.id).count();
        setFinishedQuizzes(attemptsCount);

        // Set daily study chart
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const chartData = days.map((d, i) => {
          const daySessions = studySessions.filter(s => new Date(s.startedAt).getDay() === (i + 1) % 7);
          const mins = daySessions.reduce((sum, s) => sum + Math.round((s.durationSec || 0) / 60), 0);
          return {
            day: d,
            minutes: mins
          };
        });
        setDailyStudy(chartData);

      } catch (err) {
        console.error('Failed to load parent weekly report data', err);
        setChildUser(DEMO_STUDENT.user);
        setChildProfile(DEMO_STUDENT.profile);
      } finally {
        setLoading(false);
      }
    };
    fetchChildProgress();
  }, []);

  const handleShareWhatsApp = () => {
    if (!childUser || !childProfile) return;
    const avgScore = subjectsProgress.length > 0 
      ? Math.round(subjectsProgress.reduce((sum, s) => sum + s.mastery, 0) / subjectsProgress.length)
      : 0;

    const message = `*Pathwise Weekly Report for ${childUser.name}*:\n` +
      `- Level: ${childProfile.level}\n` +
      `- Study Streak: ${childProfile.streakCurrent} Days\n` +
      `- Weekly Study: ${totalStudyMins} Minutes\n` +
      `- Quiz Average: ${avgScore}%\n` +
      `Great progress! Keep learning on Pathwise!`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="pdash" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <RefreshCw className="animate-spin" size={32} color="var(--color-primary)" />
        <p style={{ marginLeft: 'var(--sp-2)' }}>Loading weekly report data...</p>
      </div>
    );
  }

  const maxMins = Math.max(...dailyStudy.map(d => d.minutes));

  return (
    <div className="pdash" style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--sp-6)' }}>
      {/* Header */}
      <div className="pdash__header" style={{ marginBottom: 'var(--sp-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)', fontWeight: 'var(--fw-bold)', textTransform: 'uppercase' }}>Child progress</span>
          <h1 style={{ fontSize: 'var(--fs-h2)', fontWeight: 800 }}>Weekly Report</h1>
        </div>
        <Button variant="primary" icon={Share2} onClick={handleShareWhatsApp}>
          Share to WhatsApp
        </Button>
      </div>

      <Card style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: 'var(--fs-h4)', fontWeight: 800, marginBottom: 'var(--sp-4)' }}>Weekly Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
          <div style={{ padding: 'var(--sp-4)', background: 'var(--color-surface-bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <div style={{ padding: 'var(--sp-2)', background: 'rgba(0, 184, 124, 0.1)', color: 'var(--color-success)', borderRadius: 'var(--radius-sm)' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--color-text-secondary)' }}>Study Time</div>
              <div style={{ fontSize: 'var(--fs-h4)', fontWeight: 800 }}>{totalStudyMins} mins</div>
            </div>
          </div>

          <div style={{ padding: 'var(--sp-4)', background: 'var(--color-surface-bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <div style={{ padding: 'var(--sp-2)', background: 'rgba(200, 0, 24, 0.1)', color: 'var(--color-primary)', borderRadius: 'var(--radius-sm)' }}>
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--color-text-secondary)' }}>Quizzes Finished</div>
              <div style={{ fontSize: 'var(--fs-h4)', fontWeight: 800 }}>{finishedQuizzes} Quizzes</div>
            </div>
          </div>
        </div>

        {/* Subject masteries */}
        <h4 style={{ fontWeight: 800, fontSize: 'var(--fs-body-sm)', marginBottom: 'var(--sp-3)' }}>Subject Progress</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {subjectsProgress.map(subj => (
            <div key={subj.name} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: 'var(--fs-body-sm)' }}>
              <span style={{ fontWeight: 'var(--fw-semibold)', width: '120px' }}>{subj.name}</span>
              <div style={{ flex: 1, margin: '0 var(--sp-4)', alignSelf: 'center' }}>
                <ProgressBar value={subj.mastery} color={subj.color} size="sm" />
              </div>
              <span style={{ fontWeight: 'var(--fw-bold)' }}>{subj.mastery}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Study Time Chart */}
      <Card style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: 'var(--fs-h4)', fontWeight: 800, marginBottom: 'var(--sp-6)' }}>Study Time (minutes per day)</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '140px', padding: '0 var(--sp-4)', borderBottom: '1px solid var(--color-border)' }}>
          {dailyStudy.map((item, idx) => {
            const pct = maxMins > 0 ? (item.minutes / maxMins) * 100 : 0;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-1)', fontWeight: 'var(--fw-semibold)' }}>{item.minutes}m</div>
                <div style={{
                  width: '24px',
                  height: `${pct}px`,
                  background: 'linear-gradient(to top, var(--color-primary), var(--color-primary-hover))',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  transition: 'height var(--duration-normal) var(--ease-out)'
                }} />
                <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-tertiary)', marginTop: 'var(--sp-2)', fontWeight: 'var(--fw-bold)' }}>{item.day}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
        <Card style={{ padding: 'var(--sp-4)', background: 'rgba(0, 184, 124, 0.03)', borderLeft: '4px solid var(--color-success)' }}>
          <h4 style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-body-sm)', color: 'var(--color-success)', marginBottom: 'var(--sp-2)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
            <CheckCircle2 size={14} /> Strengths
          </h4>
          <p style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
            {strengths.length > 0
              ? `${childUser?.name || 'Child'} is showing high mastery in: ${strengths.join(', ')}.`
              : `${childUser?.name || 'Child'} is demonstrating solid effort across subjects.`}
          </p>
        </Card>

        <Card style={{ padding: 'var(--sp-4)', background: 'rgba(244, 180, 0, 0.03)', borderLeft: '4px solid var(--color-warning)' }}>
          <h4 style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-body-sm)', color: 'var(--color-warning)', marginBottom: 'var(--sp-2)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
            <AlertCircle size={14} /> Needs Work
          </h4>
          <p style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
            {weaknesses.length > 0
              ? `Recommended to practice: ${weaknesses.join(', ')}.`
              : `No major weak areas flagged this week. Keep up the consistent review!`}
          </p>
        </Card>
      </div>
    </div>
  );
};
