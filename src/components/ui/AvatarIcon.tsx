/* ============================================
   VIDYA AI — Emoji-Free Avatar & Achievement Icons
   ============================================ */
import React from 'react';
import {
  GraduationCap, Rocket, Heart, Sparkles, Smile, Star,
  Palette, TreePine, Zap, Book, Gem, Flame, Award,
  Gift, Trophy, Crown, FileQuestion, Target, BookOpen,
  Cpu, Compass, Gauge, Moon, Sun, User, Laptop
} from 'lucide-react';

interface IconProps {
  id: string;
  size?: number;
  color?: string;
  className?: string;
}

export const AvatarIcon: React.FC<IconProps> = ({ id, size = 20, color, className = '' }) => {
  const props = { size, color, className };
  switch (id) {
    case 'owl':
      return <GraduationCap {...props} />;
    case 'rocket':
      return <Rocket {...props} />;
    case 'lion':
      return <Heart {...props} />;
    case 'dolphin':
      return <Sparkles {...props} />;
    case 'panda':
      return <Smile {...props} />;
    case 'star':
      return <Star {...props} />;
    case 'butterfly':
      return <Palette {...props} />;
    case 'tree':
      return <TreePine {...props} />;
    case 'lightning':
      return <Zap {...props} />;
    case 'book':
      return <Book {...props} />;
    case 'gem':
      return <Gem {...props} />;
    case 'fire':
      return <Flame {...props} />;
    case 'laptop':
      return <Laptop {...props} />;
    default:
      return <User {...props} />;
  }
};

export const AchievementIcon: React.FC<IconProps> = ({ id, size = 24, color, className = '' }) => {
  const props = { size, color, className };
  switch (id) {
    case 'first-login':
      return <Gift {...props} />;
    case 'streak-3':
      return <Flame {...props} />;
    case 'streak-7':
      return <Zap {...props} />;
    case 'streak-30':
      return <Trophy {...props} />;
    case 'streak-100':
      return <Crown {...props} />;
    case 'quiz-perfect':
      return <Award {...props} />;
    case 'quiz-10':
      return <FileQuestion {...props} />;
    case 'quiz-50':
      return <Target {...props} />;
    case 'chapter-5':
      return <BookOpen {...props} />;
    case 'chapter-20':
      return <GraduationCap {...props} />;
    case 'mastery-first':
      return <Star {...props} />;
    case 'ai-chat-10':
      return <Cpu {...props} />;
    case 'all-subjects':
      return <Compass {...props} />;
    case 'speed-demon':
      return <Gauge {...props} />;
    case 'night-owl':
      return <Moon {...props} />;
    case 'early-bird':
      return <Sun {...props} />;
    default:
      return <Award {...props} />;
  }
};
