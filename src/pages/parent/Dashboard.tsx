/* ============================================
   VIDYA AI — Parent Dashboard
   ============================================ */
import React, { useEffect, useState } from 'react';
import { Card, StatCard } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/Progress';
import { Clock, TrendingUp, Flame, Award, Share2, BookOpen, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { db } from '../../lib/db';
import { DEMO_STUDENT } from '../../data/seed';
import type { User, StudentProfile } from '../../types';
import './ParentDashboard.css';

interface SubjectProgressItem {
  name: string;
  mastery: number;
  color: string;
}

export const ParentDashboard: React.FC = () => {
  const [childUser, setChildUser] = useState<User | null>(null);
  const [childProfile, setChildProfile] = useState<StudentProfile | null>(null);
  const [subjectsProgress, setSubjectsProgress] = useState<SubjectProgressItem[]>([]);
  const [totalStudyMins, setTotalStudyMins] = useState(0);
  const [finishedQuizzes, setFinishedQuizzes] = useState(0);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [classStrength, setClassStrength] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Daily study times chart values
  const [dailyStudy, setDailyStudy] = useState<{ day: string; minutes: number }[]>([]);

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

        // Set informational messages if lists are empty (no quiz data yet)
        if (strengthsList.length === 0) {
          strengthsList.push('No strengths detected yet — quizzes needed');
        }
        if (weaknessesList.length === 0) {
          weaknessesList.push('No weaknesses detected yet — quizzes needed');
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
          // distribute study sessions across days or fallback to simulation
          const daySessions = studySessions.filter(s => new Date(s.startedAt).getDay() === (i + 1) % 7);
          const mins = daySessions.reduce((sum, s) => sum + Math.round((s.durationSec || 0) / 60), 0);
          return {
            day: d,
            minutes: mins
          };
        });
        setDailyStudy(chartData);

        // Set classroom strength if in classroom mode
        if (activeProfile.learningMode === 'classroom' && activeProfile.classCode) {
          const classStudentsCount = await db.studentProfiles.where('classCode').equals(activeProfile.classCode).count();
          setClassStrength(classStudentsCount);
        } else {
          setClassStrength(null);
        }

      } catch (err) {
        console.error(err);
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
        <p style={{ marginLeft: 'var(--sp-2)' }}>Loading report data...</p>
      </div>
    );
  }

  const maxMin = Math.max(...dailyStudy.map(d => d.minutes));
  const avgScoreVal = subjectsProgress.length > 0 
    ? Math.round(subjectsProgress.reduce((sum, s) => sum + s.mastery, 0) / subjectsProgress.length)
    : 0;

  return (
    <div className="pdash">
      <div className="pdash__header">
        <h1>{childUser?.name}'s Progress</h1>
        <p>Weekly Report • This Week</p>
      </div>

      {childProfile?.learningMode === 'classroom' && childProfile.classCode && (
        <Card variant="glass" style={{ marginBottom: 'var(--sp-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-4)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Classroom Mode</span>
            <span style={{ fontSize: 'var(--fs-body)', fontWeight: 'bold', marginTop: 'var(--sp-1)' }}>Class Code: <code style={{ color: 'var(--color-primary)', letterSpacing: '1px' }}>{childProfile.classCode}</code></span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Class Strength</span>
            <span style={{ fontSize: 'var(--fs-body)', fontWeight: 'bold', marginTop: 'var(--sp-1)', display: 'block' }}>{classStrength ?? 1} students</span>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="pdash__stats">
        <StatCard label="Study Time" value={`${Math.round(totalStudyMins / 6) / 10} hrs`} icon={<Clock size={18} />} color="#45B7D1" />
        <StatCard label="Avg Score" value={`${avgScoreVal}%`} icon={<TrendingUp size={18} />} color="#00B87C" />
        <StatCard label="Streak" value={`${childProfile?.streakCurrent ?? 0} days`} icon={<Flame size={18} />} color="#FF6B6B" />
        <StatCard label="Badges" value={`${finishedQuizzes}`} icon={<Award size={18} />} color="#F7DC6F" />
      </div>

      {/* Study Time Chart */}
      <Card variant="elevated" className="pdash__chart-card">
        <h3>Daily Study Time (minutes)</h3>
        <div className="pdash__chart">
          {dailyStudy.map((d) => (
            <div key={d.day} className="pdash__chart-bar-wrap">
              <div className="pdash__chart-bar-track">
                <div
                  className="pdash__chart-bar"
                  style={{ height: `${maxMin > 0 ? (d.minutes / maxMin) * 100 : 0}%` }}
                />
              </div>
              <span className="pdash__chart-label">{d.day}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="pdash__sw-grid">
        <Card variant="elevated">
          <h3 className="pdash__sw-title" style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <CheckCircle2 size={16} /> Strengths
          </h3>
          <ul className="pdash__sw-list">
            {strengths.map((str, idx) => (
              <li key={idx}><BookOpen size={14} /> {str}</li>
            ))}
          </ul>
        </Card>
        <Card variant="elevated">
          <h3 className="pdash__sw-title" style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <AlertCircle size={16} /> Needs Work
          </h3>
          <ul className="pdash__sw-list">
            {weaknesses.map((wk, idx) => (
              <li key={idx}><BookOpen size={14} /> {wk}</li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Subject Progress */}
      <Card variant="elevated" className="pdash__subjects">
        <h3>Subject Progress</h3>
        {subjectsProgress.map((subj) => (
          <div key={subj.name} className="pdash__subject-row">
            <span className="pdash__subject-name">{subj.name}</span>
            <ProgressBar value={subj.mastery} color={subj.color} size="sm" animated={false} />
            <span className="pdash__subject-pct">{subj.mastery}%</span>
          </div>
        ))}
      </Card>

      {/* Share */}
      <Button variant="success" fullWidth icon={Share2} size="lg" onClick={handleShareWhatsApp}>
        Share Report via WhatsApp
      </Button>
    </div>
  );
};
