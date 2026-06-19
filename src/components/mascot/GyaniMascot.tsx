/* ============================================
   VIDYA AI — Gyani Mascot React Component
   ============================================ */
import React from 'react';
import './GyaniMascot.css';

export type MascotState =
  | 'default'
  | 'welcome'
  | 'celebrating'
  | 'hinting'
  | 'explaining'
  | 'thinking'
  | 'confused';

interface GyaniMascotProps {
  state?: MascotState;
  size?: 'sm' | 'md' | 'lg';
  bubbleText?: string;
  bubblePosition?: 'top' | 'left' | 'right';
  className?: string;
}

export const GyaniMascot: React.FC<GyaniMascotProps> = ({
  state = 'default',
  size = 'md',
  bubbleText,
  bubblePosition = 'top',
  className = '',
}) => {
  // Determine SVG coordinates and expression values based on state
  let beakPath = 'M 55,62 Q 60,69 65,62 Z'; // smiling beak
  let eyeLeftHeight = 8;
  let eyeRightHeight = 8;
  let eyebrowLeftPath = 'M 35,42 Q 40,40 45,43';
  let eyebrowRightPath = 'M 75,43 Q 80,40 85,42';

  if (state === 'celebrating') {
    beakPath = 'M 53,60 Q 60,75 67,60 Z'; // wide open happy beak
    eyebrowLeftPath = 'M 35,38 Q 40,36 45,39';
    eyebrowRightPath = 'M 75,39 Q 80,36 85,38';
  } else if (state === 'thinking') {
    beakPath = 'M 56,63 Q 60,65 64,63 Z'; // neutral beak
    eyebrowLeftPath = 'M 34,44 Q 40,42 46,45'; // tilted down eyebrow
    eyebrowRightPath = 'M 74,45 Q 80,42 86,44';
  } else if (state === 'confused') {
    beakPath = 'M 57,63 Q 60,61 63,63 Z'; // slight frown
    eyebrowLeftPath = 'M 34,40 Q 40,43 46,41'; // uneven brows
    eyebrowRightPath = 'M 74,45 Q 80,41 86,43';
    eyeLeftHeight = 5;
    eyeRightHeight = 10;
  } else if (state === 'hinting' || state === 'explaining') {
    beakPath = 'M 54,61 Q 60,70 66,61 Z'; // speaking beak
    eyebrowLeftPath = 'M 35,40 Q 40,38 45,41';
    eyebrowRightPath = 'M 75,41 Q 80,38 85,40';
  }

  const svgContent = (
    <svg
      viewBox="0 0 120 120"
      className={`gyani-mascot gyani-mascot--${size} gyani-mascot--${state}`}
      aria-label="Gyani Mascot Owl"
    >
      <defs>
        {/* Gradients */}
        <radialGradient id="bodyGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4A154B" />
          <stop offset="100%" stopColor="#2E0E30" />
        </radialGradient>
        <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B1D6D" />
          <stop offset="100%" stopColor="#3E1140" />
        </linearGradient>
        <linearGradient id="beakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
        <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1C1C1E" />
          <stop offset="100%" stopColor="#2C2C2E" />
        </linearGradient>
      </defs>

      {/* Feet */}
      <circle cx="48" cy="102" r="6" fill="#FF8F00" />
      <circle cx="72" cy="102" r="6" fill="#FF8F00" />

      {/* Body */}
      <ellipse cx="60" cy="75" rx="34" ry="26" fill="url(#bodyGrad)" className="body" />
      {/* Chest Pattern (academic belly shape) */}
      <path d="M 40,70 Q 60,88 80,70 Q 75,90 60,90 Q 45,90 40,70 Z" fill="#E9D6EC" opacity="0.8" className="body" />

      {/* Left Wing */}
      <path d="M 26,65 C 10,65 14,88 28,82 C 32,80 34,74 34,68 Z" fill="url(#wingGrad)" className="wing-left" />
      {/* Right Wing */}
      <path d="M 94,65 C 110,65 106,88 92,82 C 88,80 86,74 86,68 Z" fill="url(#wingGrad)" className="wing-right" />

      {/* Head */}
      <g className="head">
        {/* Base Head */}
        <circle cx="60" cy="50" r="32" fill="url(#bodyGrad)" />
        {/* Ears / Tufts */}
        <path d="M 32,32 L 20,15 L 42,25 Z" fill="url(#bodyGrad)" />
        <path d="M 88,32 L 100,15 L 78,25 Z" fill="url(#bodyGrad)" />

        {/* Eye Plates (Whites of eyes structure) */}
        <ellipse cx="42" cy="50" rx="14" ry="14" fill="#FFFFFF" />
        <ellipse cx="78" cy="50" rx="14" ry="14" fill="#FFFFFF" />

        {/* Left Pupil */}
        <ellipse cx="42" cy="50" rx="7" ry={eyeLeftHeight} fill="#1C1C1E" className="eye-left" />
        <circle cx="40" cy="47" r="2.5" fill="#FFFFFF" className="eye-left" /> {/* pupil highlight */}
        
        {/* Right Pupil */}
        <ellipse cx="78" cy="50" rx="7" ry={eyeRightHeight} fill="#1C1C1E" className="eye-right" />
        <circle cx="76" cy="47" r="2.5" fill="#FFFFFF" className="eye-right" /> {/* pupil highlight */}

        {/* Eyebrows */}
        <path d={eyebrowLeftPath} stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d={eyebrowRightPath} stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Glasses bridge */}
        <path d="M 52,50 L 68,50" stroke="#FFC107" strokeWidth="3" strokeLinecap="round" />
        {/* Glasses rims */}
        <circle cx="42" cy="50" r="14.5" fill="none" stroke="#FFC107" strokeWidth="3.5" />
        <circle cx="78" cy="50" r="14.5" fill="none" stroke="#FFC107" strokeWidth="3.5" />

        {/* Beak */}
        <path d={beakPath} fill="url(#beakGrad)" />

        {/* Graduate Cap / Mortarboard */}
        <g transform="translate(60, 20) scale(0.9)">
          {/* Skull cap */}
          <path d="M -16,0 C -16,-8 16,-8 16,0 L 12,6 C 12,6 -12,6 -12,6 Z" fill="#1C1C1E" />
          {/* Top Diamond */}
          <polygon points="0,-16 32,-7 0,2 -32,-7" fill="url(#capGrad)" stroke="#3A3A3C" strokeWidth="1" />
          {/* Tassel */}
          <path d="M 0,-7 L 22,-3 L 24,10" fill="none" stroke="#FF8F00" strokeWidth="1.5" strokeLinecap="round" />
          <polygon points="22,10 26,10 24,15" fill="#FF8F00" />
        </g>
      </g>
    </svg>
  );

  return (
    <div className={`gyani-mascot-container ${className}`}>
      {bubbleText && bubblePosition === 'top' && (
        <div className="gyani-bubble gyani-bubble--top">
          {bubbleText}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
        {bubbleText && bubblePosition === 'left' && (
          <div className="gyani-bubble gyani-bubble--left">
            {bubbleText}
          </div>
        )}
        {svgContent}
        {bubbleText && bubblePosition === 'right' && (
          <div className="gyani-bubble gyani-bubble--right">
            {bubbleText}
          </div>
        )}
      </div>
    </div>
  );
};
