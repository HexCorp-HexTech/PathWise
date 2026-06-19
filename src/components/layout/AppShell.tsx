/* ============================================
   PATHWISE — AppShell Layout with Header Bar
   ============================================ */
import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { NetworkStatusPill } from '../network/NetworkStatus';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../lib/db';
import type { Classroom } from '../../types';
import { Plus, GraduationCap } from 'lucide-react';
import './AppShell.css';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { sidebarCollapsed, isMobile, language, setLanguage } = useAppStore();
  const { user, teacherProfile, studentProfile, loginTeacher } = useAuthStore();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  // Load classrooms for teacher
  useEffect(() => {
    const fetchClassrooms = async () => {
      if (user?.role === 'teacher') {
        const list = await db.classrooms.where('teacherId').equals(user.id).toArray();
        setClassrooms(list);
        
        // Ensure teacher has an active classroom
        if (list.length > 0 && !teacherProfile?.activeClassroomCode) {
          loginTeacher(user, {
            ...teacherProfile!,
            activeClassroomCode: list[0].id
          });
        }
      }
    };
    fetchClassrooms();
  }, [user, teacherProfile, loginTeacher]);

  // Clear cached data on language switch so that chapters, quizzes and notes regenerate in the selected language
  useEffect(() => {
    const clearContentCache = async () => {
      try {
        await db.notes.clear();
        await db.quizQuestions.clear();
        await db.flashcards.clear();
        console.log(`[AppShell] Cleared content cache on language change to: ${language}`);
      } catch (err) {
        console.error('[AppShell] Failed to clear content cache on language switch', err);
      }
    };
    clearContentCache();
  }, [language]);

  const handleSelectClassroom = async (code: string) => {
    if (user && teacherProfile) {
      const updatedProfile = {
        ...teacherProfile,
        activeClassroomCode: code
      };
      
      // Update in store
      loginTeacher(user, updatedProfile);
      
      // Update in Dexie
      await db.teacherProfiles.put(updatedProfile);
      
      // Trigger simple page reload or custom event to notify page components
      window.dispatchEvent(new Event('classroomChanged'));
    }
  };

  const handleCreateClassroom = async () => {
    const name = prompt("Enter Classroom Name (e.g. Class 7B, Class 9 Science):");
    if (!name || !name.trim() || !user || !teacherProfile) return;

    const cleanName = name.trim();
    // Generate code: e.g. "9S-QT82K"
    const initials = cleanName.replace(/Class\s*/i, '').slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const randCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const classCode = `${initials || 'CL'}-${randCode}`;

    const newClassroom: Classroom = {
      id: classCode,
      name: cleanName,
      teacherId: user.id,
      grade: 10,
      createdAt: Date.now()
    };

    try {
      await db.classrooms.add(newClassroom);
      setClassrooms(prev => [...prev, newClassroom]);
      await handleSelectClassroom(classCode);
    } catch (err) {
      console.error('Failed to create classroom', err);
    }
  };

  return (
    <div className="app-shell">
      {!isMobile && <Sidebar />}
      <main
        className="app-shell__main"
        style={{
          marginLeft: isMobile ? 0 : sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
          paddingBottom: isMobile ? 'calc(var(--bottom-nav-height) + var(--sp-4))' : 0,
        }}
      >
        {/* Global Top Header Bar */}
        <header className="global-header">
          <div className="global-header__left">
            <span className="global-header__logo-text">
              <GraduationCap size={20} color="var(--color-primary)" />
              {!isMobile && <span>Pathwise</span>}
            </span>
            
            {user?.role === 'student' && studentProfile?.classCode && (
              <span className="global-header__classroom-tag">
                Class Code: {studentProfile.classCode}
              </span>
            )}
            
            {user?.role === 'student' && !studentProfile?.classCode && (
              <span className="global-header__classroom-tag" style={{ color: 'var(--color-text-tertiary)' }}>
                Solo Mode
              </span>
            )}
          </div>

          <div className="global-header__right">
            {/* Classroom Switcher Dropdown (Teacher) */}
            {user?.role === 'teacher' && teacherProfile && (
              <div className="class-switcher">
                <select
                  className="class-switcher__select"
                  value={teacherProfile.activeClassroomCode || ''}
                  onChange={(e) => handleSelectClassroom(e.target.value)}
                >
                  <option value="" disabled>Select Classroom</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
                <button
                  className="class-switcher__btn"
                  onClick={handleCreateClassroom}
                  title="Create New Classroom"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}

            {/* Language Switch */}
            <div className="lang-toggle">
              <button
                className={`lang-toggle__btn ${language === 'en' ? 'lang-toggle__btn--active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
              <button
                className={`lang-toggle__btn ${language === 'hi' ? 'lang-toggle__btn--active' : ''}`}
                onClick={() => setLanguage('hi')}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </header>

        <NetworkStatusPill />
        
        <div className="app-content-body">
          {children}
        </div>
      </main>
      {isMobile && <BottomNav />}
    </div>
  );
};
