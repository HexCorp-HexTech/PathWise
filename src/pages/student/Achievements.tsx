/* ============================================
   VIDYA AI — Achievements Page
   ============================================ */
import React from 'react';
import { Flame, Zap, Trophy } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ProgressBar, ProgressRing } from '../../components/ui/Progress';
import { useAuthStore } from '../../store/authStore';
import { ACHIEVEMENTS, AVATARS } from '../../data/seed';
import { xpToLevel } from '../../lib/utils';
import { AvatarIcon, AchievementIcon } from '../../components/ui/AvatarIcon';
import './Achievements.css';

export const AchievementsPage: React.FC = () => {
  const { studentProfile, user } = useAuthStore();
  const xp = studentProfile?.xpTotal ?? 0;
  const levelInfo = xpToLevel(xp);
  const avatar = AVATARS.find(a => a.id === user?.avatarId);

  // Simulated earned achievements
  const earnedIds = ['first-login', 'streak-3', 'streak-7', 'quiz-10', 'chapter-5', 'ai-chat-10', 'night-owl'];

  return (
    <div className="achieve-page">
      {/* Profile Card */}
      <Card variant="elevated" className="achieve-profile">
        <div className="achieve-profile__avatar-container" style={{ margin: '0 auto var(--sp-3) auto', display: 'flex', justifyContent: 'center' }}>
          <AvatarIcon id={user?.avatarId || 'owl'} size={48} color={avatar?.color || 'var(--color-primary)'} />
        </div>
        <h2 className="achieve-profile__name">{user?.name}</h2>
        <p className="achieve-profile__grade">Grade {studentProfile?.grade} • {studentProfile?.board}</p>

        <div className="achieve-profile__level">
          <ProgressRing
            value={levelInfo.current}
            max={levelInfo.needed}
            size={100}
            strokeWidth={6}
            color="var(--color-primary)"
          >
            <span style={{ fontSize: 'var(--fs-h2)', fontWeight: 800 }}>{levelInfo.level}</span>
            <span style={{ fontSize: 'var(--fs-overline)', color: 'var(--color-text-tertiary)' }}>Level</span>
          </ProgressRing>
          <div className="achieve-profile__xp-info">
            <p><strong>{xp.toLocaleString()}</strong> Total XP</p>
            <ProgressBar value={levelInfo.current} max={levelInfo.needed} variant="gradient" size="sm" showLabel />
            <p className="achieve-profile__xp-next">{levelInfo.needed - levelInfo.current} XP to next level</p>
          </div>
        </div>

        <div className="achieve-profile__stats">
          <div className="achieve-stat">
            <span className="achieve-stat__value" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
              <Flame size={16} color="#FF6B6B" /> {studentProfile?.streakCurrent}
            </span>
            <span className="achieve-stat__label">Current Streak</span>
          </div>
          <div className="achieve-stat">
            <span className="achieve-stat__value" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
              <Zap size={16} color="#F7DC6F" /> {studentProfile?.streakBest}
            </span>
            <span className="achieve-stat__label">Best Streak</span>
          </div>
          <div className="achieve-stat">
            <span className="achieve-stat__value" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
              <Trophy size={16} color="#BB8FCE" /> {earnedIds.length}
            </span>
            <span className="achieve-stat__label">Badges</span>
          </div>
        </div>
      </Card>

      {/* Achievements Grid */}
      <h2 className="achieve-section-title">Achievements</h2>
      <div className="achieve-grid">
        {ACHIEVEMENTS.map((achievement) => {
          const isEarned = earnedIds.includes(achievement.id);
          return (
            <Card
              key={achievement.id}
              variant={isEarned ? 'elevated' : 'outlined'}
              padding="sm"
              className={`achieve-badge ${isEarned ? '' : 'achieve-badge--locked'}`}
            >
              <div className="achieve-badge__icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-2)' }}>
                <AchievementIcon id={achievement.icon} size={32} color={isEarned ? 'var(--color-primary)' : 'var(--color-text-tertiary)'} />
              </div>
              <h4 className="achieve-badge__title">{achievement.title}</h4>
              <p className="achieve-badge__desc">{achievement.description}</p>
              <div className="achieve-badge__footer">
                <span className={`achieve-badge__rarity achieve-badge__rarity--${achievement.rarity}`}>
                  {achievement.rarity}
                </span>
                <span className="achieve-badge__xp">+{achievement.xpReward} XP</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
