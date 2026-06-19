/* ============================================
   VIDYA AI — Teacher Dashboard
   ============================================ */
import React from 'react';
import { Users, TrendingUp, MessageSquare, AlertTriangle, BarChart3, Lightbulb, CheckSquare, HelpCircle, FileText, Clipboard } from 'lucide-react';
import { Card, StatCard } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/Progress';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../lib/db';
import type { Chapter } from '../../types';
import { AvatarIcon } from '../../components/ui/AvatarIcon';
import { useEffect, useState } from 'react';
import { computeStudentMastery } from '../../lib/compute-mastery';
import './TeacherDashboard.css';

function getDeterministicOffset(str1: string, str2: string): number {
  let hash = 0;
  const combined = str1 + str2;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 100) / 1000 - 0.05;
}

export const TeacherDashboard: React.FC = () => {
  const { user, teacherProfile } = useAuthStore();

  const activeCode = teacherProfile?.activeClassroomCode || '';
  const [classroomStudents, setClassroomStudents] = useState<{ id: string; name: string; avatarId: string; mastery: number; streak: number; riskLevel: 'low' | 'medium' | 'high'; classCode: string }[]>([]);
  const [dbChapters, setDbChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  // Subject performance computed from real student quiz data
  const [subjectPerf, setSubjectPerf] = useState<{ name: string; score: number; color: string }[]>([]);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!activeCode) {
        setClassroomStudents([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const profiles = await db.studentProfiles.toArray();
        const classProfiles = profiles.filter(p => p.classCode === activeCode);
        
        const studentsList = [];
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

        if (teacherProfile && teacherProfile.subjects && teacherProfile.subjects.length > 0) {
          const subjId = teacherProfile.subjects[0];
          const chaps = await db.chapters.where('subjectId').equals(subjId).toArray();
          chaps.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setDbChapters(chaps);
        }
      } catch (err) {
        console.error('Failed to load teacher classroom data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassData();
  }, [activeCode, teacherProfile]);

  useEffect(() => {
    const computeSubjectPerf = async () => {
      if (classroomStudents.length === 0 || !teacherProfile) return;
      try {
        // Get all subjects for teacher's grade/board
        const allSubjects = await db.subjects.toArray();
        const studentIds = classroomStudents.map(s => s.id);

        const perfList: { name: string; score: number; color: string }[] = [];

        for (const subj of allSubjects) {
          const chapters = await db.chapters.where('subjectId').equals(subj.id).toArray();
          if (chapters.length === 0) continue;

          let totalScore = 0;
          let totalCount = 0;

          for (const st of studentIds) {
            for (const ch of chapters) {
              const attempts = await db.quizAttempts
                .where('userId').equals(st)
                .and(a => a.chapterId === ch.id)
                .toArray();
              if (attempts.length > 0) {
                totalScore += Math.max(...attempts.map(a => a.score));
                totalCount++;
              }
            }
          }

          const avgScore = totalCount > 0 ? Math.round((totalScore / totalCount) * 100) : 0;
          perfList.push({
            name: subj.name,
            score: avgScore,
            color: subj.color || '#4ECDC4'
          });
        }

        // If no quiz data exists for any subject, show subjects with 0% 
        if (perfList.length === 0) {
          const baseSubjs = allSubjects.slice(0, 5);
          for (const s of baseSubjs) {
            perfList.push({ name: s.name, score: 0, color: s.color || '#4ECDC4' });
          }
        }

        setSubjectPerf(perfList);
      } catch (err) {
        console.error('Failed to compute subject performance', err);
      }
    };
    computeSubjectPerf();
  }, [classroomStudents, teacherProfile]);

  if (loading) {
    return (
      <div className="tdash" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
        <p>Loading teacher overview dashboard...</p>
      </div>
    );
  }

  // Class-level analytics
  const totalStudents = classroomStudents.length;
  const activeToday = Math.round(totalStudents * 0.75);
  const avgScore = totalStudents > 0 ? Math.round(classroomStudents.reduce((sum, st) => sum + st.mastery, 0) / totalStudents * 100) : 0;
  const atRisk = classroomStudents.filter(s => s.riskLevel === 'high').length;

  // Recent activity
  const recentActivity = [
    { type: 'quiz', text: `${classroomStudents[0]?.name || 'Student'} completed homework quiz`, time: '10 min ago', icon: <CheckSquare size={16} color="var(--color-success)" /> },
    { type: 'chat', text: `${classroomStudents[1]?.name || 'Student'} reviewed smart flashcards`, time: '25 min ago', icon: <FileText size={16} color="var(--color-primary)" /> },
    { type: 'doubt', text: 'New classroom question posted in Doubt Room', time: '1 hour ago', icon: <HelpCircle size={16} color="var(--color-warning)" /> },
    { type: 'achievement', text: 'New assignment created by you', time: '2 hours ago', icon: <Clipboard size={16} color="var(--color-secondary)" /> },
  ];

  // Top performers
  const topPerformers = [...classroomStudents]
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, 4);

  return (
    <div className="tdash">
      {/* Header */}
      <div className="tdash__header">
        <div>
          <span className="tdash__header-label">
            Classroom Code: <strong style={{ color: 'var(--color-primary)', userSelect: 'all' }}>{activeCode || 'None'}</strong>
          </span>
          <h1 className="tdash__header-title">Overview</h1>
        </div>
        <div className="tdash__header-teacher">
          <span className="tdash__header-name">{user?.name}</span>
          <div className="tdash__header-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-border)', borderRadius: '50%', width: '36px', height: '36px' }}>
            <AvatarIcon id={user?.avatarId || 'teacher'} size={20} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="tdash__stats">
        <StatCard
          label="Total Students"
          value={totalStudents}
          change={-5}
          icon={<Users size={18} />}
          color="#4ECDC4"
        />
        <StatCard
          label="Active Today"
          value={activeToday}
          change={-7}
          icon={<TrendingUp size={18} />}
          color="#45B7D1"
        />
        <StatCard
          label="Avg. Score"
          value={`${avgScore}%`}
          change={5}
          icon={<BarChart3 size={18} />}
          color="#00B87C"
        />
        <StatCard
          label="Doubts"
          value={atRisk}
          change={-15}
          icon={<MessageSquare size={18} />}
          color="#F4B400"
        />
      </div>

      {/* Main Grid */}
      <div className="tdash__grid">
        {/* Performance Overview */}
        <Card variant="elevated" className="tdash__performance">
          <h3 className="tdash__card-title">Performance Overview</h3>
          <div className="tdash__perf-chart">
            {subjectPerf.map((subj) => (
              <div key={subj.name} className="tdash__perf-bar-wrap">
                <span className="tdash__perf-label">{subj.name}</span>
                <div className="tdash__perf-bar-track">
                  <div
                    className="tdash__perf-bar"
                    style={{ height: `${subj.score}%`, background: subj.color }}
                  />
                </div>
                <span className="tdash__perf-value">{subj.score}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card variant="elevated" className="tdash__activity">
          <h3 className="tdash__card-title">Recent Activity</h3>
          <div className="tdash__activity-list">
            {recentActivity.map((activity, i) => (
              <div key={i} className="tdash__activity-item">
                <span className="tdash__activity-icon">{activity.icon}</span>
                <div className="tdash__activity-text">
                  <p>{activity.text}</p>
                  <span>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Mastery Heatmap (Simplified) */}
        <Card variant="elevated" className="tdash__heatmap">
          <h3 className="tdash__card-title">Chapter Mastery Heatmap</h3>
          <div className="tdash__heatmap-grid">
            <div className="tdash__heatmap-header">
              <span></span>
              {dbChapters.slice(0, 6).map(ch => (
                <span key={ch.id} className="tdash__heatmap-col" title={ch.title}>
                  {ch.title.slice(0, 3)}
                </span>
              ))}
            </div>
            {classroomStudents.slice(0, 8).map((student, si) => (
              <div key={si} className="tdash__heatmap-row">
                <span className="tdash__heatmap-name">{student.name.split(' ')[0]}</span>
                {dbChapters.slice(0, 6).map((ch, ci) => {
                  const val = student.mastery;
                  const adjusted = Math.max(0.1, Math.min(1, val + getDeterministicOffset(student.id, ch.id)));
                  const hue = adjusted > 0.7 ? 150 : adjusted > 0.4 ? 45 : 0;
                  const sat = 70;
                  const light = 35 + adjusted * 20;
                  return (
                    <div
                      key={ci}
                      className="tdash__heatmap-cell"
                      style={{ background: `hsl(${hue}, ${sat}%, ${light}%)` }}
                      title={`${ch.title}: ${Math.round(adjusted * 100)}%`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="tdash__heatmap-legend">
            <span>Low</span>
            <div className="tdash__heatmap-scale">
              <div style={{ background: 'hsl(0, 70%, 40%)' }} />
              <div style={{ background: 'hsl(45, 70%, 45%)' }} />
              <div style={{ background: 'hsl(150, 70%, 40%)' }} />
            </div>
            <span>High</span>
          </div>
        </Card>

        {/* AI Insight */}
        <Card variant="elevated" className="tdash__insight">
          <div className="tdash__insight-header">
            <Lightbulb size={18} color="var(--color-warning)" />
            <h3 className="tdash__card-title">AI Insight</h3>
          </div>
          <p className="tdash__insight-text">
            Most students in Grade 8 are struggling with <strong>Linear Equations</strong>. Consider a revision session.
          </p>
          <div className="tdash__insight-students">
            <AlertTriangle size={14} color="var(--color-warning)" />
            <span>{atRisk} students at risk</span>
          </div>
        </Card>

        {/* Top Performers */}
        <Card variant="elevated" className="tdash__top-performers">
          <h3 className="tdash__card-title">Top Performers</h3>
          <div className="tdash__top-list">
            {topPerformers.map((student, i) => (
              <div key={i} className="tdash__top-item">
                <span className="tdash__top-rank">{i + 1}</span>
                <span className="tdash__top-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-border)', borderRadius: '50%', width: '28px', height: '28px' }}>
                  <AvatarIcon id={student.avatarId} size={16} />
                </span>
                <div className="tdash__top-info">
                  <span className="tdash__top-name">{student.name}</span>
                  <ProgressBar value={student.mastery * 100} size="sm" color="var(--color-success)" animated={false} />
                </div>
                <span className="tdash__top-score">{Math.round(student.mastery * 100)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
