/* ============================================
   VIDYA AI — Sidebar Navigation
   ============================================ */
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, MessageSquare, Trophy,
  Settings, Users, BarChart3, FileText,
  HelpCircle, Lightbulb, ChevronLeft, ChevronRight, LogOut,
  GraduationCap, ClipboardList
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../lib/translations';
import type { TranslationKey } from '../../lib/translations';
import type { UserRole } from '../../types';
import './Sidebar.css';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const studentNav: NavItem[] = [
  { path: '/student', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/student/subjects', label: 'Subjects', icon: <BookOpen size={20} /> },
  { path: '/student/tutor', label: 'AI Tutor', icon: <MessageSquare size={20} /> },
  { path: '/student/achievements', label: 'Achievements', icon: <Trophy size={20} /> },
  { path: '/student/doubts', label: 'Doubt Room', icon: <HelpCircle size={20} /> },
  { path: '/student/settings', label: 'Settings', icon: <Settings size={20} /> },
];

const teacherNav: NavItem[] = [
  { path: '/teacher', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { path: '/teacher/students', label: 'Students', icon: <Users size={20} /> },
  { path: '/teacher/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  { path: '/teacher/assignments', label: 'Assignments', icon: <ClipboardList size={20} /> },
  { path: '/teacher/doubts', label: 'Doubt Room', icon: <HelpCircle size={20} /> },
  { path: '/teacher/content', label: 'Content', icon: <FileText size={20} /> },
  { path: '/teacher/insights', label: 'AI Insights', icon: <Lightbulb size={20} /> },
  { path: '/teacher/settings', label: 'Settings', icon: <Settings size={20} /> },
];

const parentNav: NavItem[] = [
  { path: '/parent', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/parent/report', label: 'Reports', icon: <BarChart3 size={20} /> },
  { path: '/parent/settings', label: 'Settings', icon: <Settings size={20} /> },
];

function getNavItems(role: UserRole | null): NavItem[] {
  switch (role) {
    case 'student': return studentNav;
    case 'teacher': return teacherNav;
    case 'parent': return parentNav;
    default: return [];
  }
}

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const { t } = useTranslation();
  const navItems = getNavItems(user?.role ?? null);

  const mapLabelToKey = (label: string): TranslationKey => {
    const mapping: Record<string, TranslationKey> = {
      'Dashboard': 'dashboard',
      'Subjects': 'subjects',
      'AI Tutor': 'aiTutor',
      'Achievements': 'achievements',
      'Doubt Room': 'doubtRoom',
      'Settings': 'settings',
      'Overview': 'overview',
      'Students': 'students',
      'Analytics': 'analytics',
      'Assignments': 'assignments',
      'Content': 'content',
      'AI Insights': 'aiInsights',
      'Reports': 'reports',
      'Logout': 'logout'
    };
    return mapping[label] || (label.toLowerCase() as TranslationKey);
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <GraduationCap size={24} color="var(--color-primary)" />
        </div>
        {!sidebarCollapsed && (
          <span className="sidebar__logo-text">Path<span className="sidebar__logo-ai">wise</span></span>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const transKey = mapLabelToKey(item.label);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/student' || item.path === '/teacher' || item.path === '/parent'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              title={sidebarCollapsed ? t(transKey) : undefined}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="sidebar__link-label">{t(transKey)}</span>}
              {location.pathname === item.path && <span className="sidebar__link-indicator" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="sidebar__bottom">
        <button className="sidebar__link sidebar__logout" onClick={logout} title={t('logout')}>
          <span className="sidebar__link-icon"><LogOut size={20} /></span>
          {!sidebarCollapsed && <span className="sidebar__link-label">{t('logout')}</span>}
        </button>

        <button
          className="sidebar__toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
