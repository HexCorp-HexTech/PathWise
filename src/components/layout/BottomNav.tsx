/* ============================================
   VIDYA AI — Bottom Navigation (Mobile)
   ============================================ */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, MessageSquare, Trophy, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import './BottomNav.css';

export const BottomNav: React.FC = () => {
  const { user } = useAuthStore();
  const role = user?.role;

  const studentItems = [
    { path: '/student', label: 'Home', icon: LayoutDashboard },
    { path: '/student/subjects', label: 'Subjects', icon: BookOpen },
    { path: '/student/tutor', label: 'AI Tutor', icon: MessageSquare },
    { path: '/student/achievements', label: 'Progress', icon: Trophy },
    { path: '/student/settings', label: 'More', icon: BarChart3 },
  ];

  const teacherItems = [
    { path: '/teacher', label: 'Home', icon: LayoutDashboard },
    { path: '/teacher/students', label: 'Students', icon: BookOpen },
    { path: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/teacher/assignments', label: 'Tasks', icon: Trophy },
    { path: '/teacher/settings', label: 'More', icon: BarChart3 },
  ];

  const items = role === 'teacher' ? teacherItems : studentItems;

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/student' || item.path === '/teacher'}
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
          }
        >
          <item.icon size={20} />
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
