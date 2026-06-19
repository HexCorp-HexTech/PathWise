/* ============================================
   VIDYA AI — Teacher AI Insights Dashboard
   ============================================ */
import React from 'react';
import { Lightbulb, Sparkles, ArrowRight, ShieldAlert, Award } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const AIInsightsPage: React.FC = () => {
  const navigate = useNavigate();

  const insights = [
    {
      type: 'warning',
      title: 'Concept Block Detected',
      desc: '7 students scored below 60% on the latest Linear Equations quiz. The difficulty adaptation curve suggests students are hitting a roadblock with step substitutions.',
      action: 'Assign Revision Homework',
      route: '/teacher/assignments',
      icon: <ShieldAlert size={18} color="var(--color-error)" />,
      bg: 'rgba(217, 48, 37, 0.03)'
    },
    {
      type: 'success',
      title: 'Optimal Retention',
      desc: 'Class average retention rate on Force and Motion is currently estimated at 92%. The SM-2 spaced repetition schedules show high stability in short-term recalls.',
      action: 'Create Extension Work',
      route: '/teacher/content',
      icon: <Award size={18} color="var(--color-success)" />,
      bg: 'rgba(0, 184, 124, 0.03)'
    },
    {
      type: 'suggestion',
      title: 'Doubt Room Activity Spike',
      desc: 'There are 3 unresolved queries in Tenses. We suggest reviewing simple past vs present perfect continuous rules in the next class.',
      action: 'Go to Doubt Room',
      route: '/teacher/doubts',
      icon: <Lightbulb size={18} color="var(--color-warning)" />,
      bg: 'rgba(244, 180, 0, 0.03)'
    }
  ];

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
              Hello Instructor Priya Sharma! Overall class engagement has increased by 14% due to daily streaks in Science flashcards. Mathematics requires focus as BKT (Bayesian Knowledge Tracing) shows mastery probability hovering below the target threshold for 30% of the class.
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
