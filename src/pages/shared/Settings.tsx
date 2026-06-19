/* ============================================
   VIDYA AI — Settings Page (Shared)
   ============================================ */
import React from 'react';
import { Moon, Sun, Globe, Type, Volume2, Wifi, Shield, LogOut, ChevronRight, User } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { AVATARS } from '../../data/seed';
import { AvatarIcon } from '../../components/ui/AvatarIcon';
import { db } from '../../lib/db';
import { useTranslation } from '../../lib/translations';
import './Settings.css';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, language, setLanguage, fontSize, setFontSize } = useAppStore();
  const { user, studentProfile, teacherProfile, logout } = useAuthStore();
  const { t } = useTranslation();

  const avatar = AVATARS.find(a => a.id === user?.avatarId);

  const settingSections = [
    {
      title: t('appearance'),
      items: [
        {
          icon: theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />,
          label: t('theme'),
          value: theme === 'dark' ? 'Dark' : 'Light',
          action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
        },
        {
          icon: <Type size={20} />,
          label: t('fontSize'),
          value: fontSize.charAt(0).toUpperCase() + fontSize.slice(1),
          action: () => setFontSize(fontSize === 'small' ? 'medium' : fontSize === 'medium' ? 'large' : 'small'),
        },
      ],
    },
    {
      title: t('langVoice'),
      items: [
        {
          icon: <Globe size={20} />,
          label: t('language'),
          value: language === 'en' ? 'English' : 'हिन्दी',
          action: async () => {
            const newLang = language === 'en' ? 'hi' : 'en';
            setLanguage(newLang as any);
            // Clear all cached notes and quiz questions so they regenerate in the new language
            try {
              await db.notes.clear();
              await db.quizQuestions.clear();
              await db.flashcards.clear();
              console.log(`[Settings] Cleared notes, quiz questions, and flashcards cache for language switch to: ${newLang}`);
            } catch (err) {
              console.error('[Settings] Failed to clear content cache on language switch', err);
            }
          },
        },
        {
          icon: <Volume2 size={20} />,
          label: t('voice'),
          value: language === 'en' ? 'English' : 'Hindi',
          action: () => {},
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          icon: <Wifi size={20} />,
          label: t('offlineStorage'),
          value: '42 MB used',
          action: () => {},
        },
        {
          icon: <Shield size={20} />,
          label: t('privacy'),
          value: '',
          action: () => {},
        },
      ],
    },
  ];

  return (
    <div className="settings-page">
      <h1 className="settings-title">{t('settings')}</h1>

      {/* Profile Card */}
      <Card variant="elevated" className="settings-profile">
        <div className="settings-profile__avatar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AvatarIcon id={user?.avatarId || 'owl'} size={36} color={avatar?.color || 'var(--color-primary)'} />
        </div>
        <div className="settings-profile__info" style={{ marginLeft: 'var(--sp-3)' }}>
          <h3>{user?.name}</h3>
          <p>{user?.role === 'student' ? t('students') : user?.role === 'teacher' ? 'Teacher' : 'Parent'}</p>
          {user?.role === 'teacher' && teacherProfile?.activeClassroomCode && (
            <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-primary)', marginTop: '4px' }}>
              Class Code: <strong style={{ userSelect: 'all' }}>{teacherProfile.activeClassroomCode}</strong>
            </p>
          )}
          {user?.role === 'student' && studentProfile?.classCode && (
            <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-primary)', marginTop: '4px' }}>
              Class Code: <strong style={{ userSelect: 'all' }}>{studentProfile.classCode}</strong>
            </p>
          )}
          {user?.role === 'student' && (
            <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-primary)', marginTop: '4px' }}>
              Parent Access Code: <strong style={{ userSelect: 'all' }}>{user.id}</strong>
            </p>
          )}
        </div>
        <button className="settings-profile__edit">
          <User size={16} /> {t('editProfile')}
        </button>
      </Card>

      {/* Setting Sections */}
      {settingSections.map((section) => (
        <div key={section.title} className="settings-section">
          <h3 className="settings-section__title">{section.title}</h3>
          <Card variant="elevated" padding="none">
            {section.items.map((item, i) => (
              <button
                key={i}
                className="settings-item"
                onClick={item.action}
              >
                <span className="settings-item__icon">{item.icon}</span>
                <span className="settings-item__label">{item.label}</span>
                <span className="settings-item__value">{item.value}</span>
                <ChevronRight size={16} className="settings-item__chevron" />
              </button>
            ))}
          </Card>
        </div>
      ))}

      {/* Logout */}
      <button className="settings-logout" onClick={logout}>
        <LogOut size={18} />
        <span>{t('logout')}</span>
      </button>
    </div>
  );
};
