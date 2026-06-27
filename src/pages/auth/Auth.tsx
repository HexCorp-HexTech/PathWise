/* ============================================
   VIDYA AI — Auth Flow Pages
   ============================================ */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, User, BookOpen, Users, ArrowLeft, Eye, EyeOff, Mail, Lock, Globe } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { generateId } from '../../lib/utils';
import { AVATARS, DEMO_STUDENT, DEMO_TEACHER } from '../../data/seed';
import { AvatarIcon } from '../../components/ui/AvatarIcon';
import type { Board, Language } from '../../types';
import { db } from '../../lib/db';
import './Auth.css';

/* Role Selection */
export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  const roles = [
    { id: 'student', label: 'Student', desc: 'I want to learn', icon: <BookOpen size={32} />, color: '#4ECDC4', path: '/auth/student/login' },
    { id: 'teacher', label: 'Teacher', desc: 'I want to teach', icon: <User size={32} />, color: '#FF6B6B', path: '/auth/teacher/login' },
    { id: 'parent', label: 'Parent', desc: 'I want to track', icon: <Users size={32} />, color: '#F7DC6F', path: '/auth/parent/login' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-container auth-container--role">
        <div className="auth-logo">
          <GraduationCap size={32} color="var(--color-primary)" />
          <span className="auth-logo-text">Path<span className="text-primary">wise</span></span>
        </div>
        <h1 className="auth-title">Welcome to Pathwise</h1>
        <p className="auth-subtitle">Choose your role to get started</p>

        <div className="auth-roles">
          {roles.map((role) => (
            <button
              key={role.id}
              className="auth-role-card"
              onClick={() => navigate(role.path)}
            >
              <div className="auth-role-icon" style={{ color: role.color, background: `${role.color}15` }}>
                {role.icon}
              </div>
              <h3 className="auth-role-label">{role.label}</h3>
              <p className="auth-role-desc">{role.desc}</p>
            </button>
          ))}
        </div>

        <button className="auth-back-link" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to home
        </button>
      </div>
    </div>
  );
};

/* Student Login */
export const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginStudent, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const allUsers = await db.users.where('role').equals('student').toArray();
        setStudents(allUsers);
        if (allUsers.length > 0) {
          setSelectedStudentId(allUsers[0].id);
        }
      } catch (err) {
        console.error('Failed to load students', err);
      }
    };
    fetchStudents();
  }, []);

  const handleLogin = async () => {
    if (pin.length < 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    const studentId = selectedStudentId || (students.length > 0 ? students[0].id : DEMO_STUDENT.user.id);
    try {
      const u = await db.users.get(studentId);
      const p = await db.studentProfiles.get(studentId);
      if (u && p) {
        if (u.pin && u.pin !== pin) {
          setError('Incorrect PIN. Please try again.');
          return;
        }
        loginStudent(u, p);
        navigate('/student');
      } else {
        loginStudent(DEMO_STUDENT.user, DEMO_STUDENT.profile);
        navigate('/student');
      }
    } catch (err) {
      loginStudent(DEMO_STUDENT.user, DEMO_STUDENT.profile);
      navigate('/student');
    }
  };

  const handleDemoLogin = () => {
    loginStudent(DEMO_STUDENT.user, DEMO_STUDENT.profile);
    navigate('/student');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button className="auth-back-btn" onClick={() => navigate('/auth')}>
          <ArrowLeft size={18} />
        </button>

        <div className="auth-header">
          <div className="auth-mascot-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-2)' }}>
            <GraduationCap size={44} color="var(--color-primary)" />
          </div>
          <h1 className="auth-title">Welcome back!</h1>
          <p className="auth-subtitle">Select profile and enter PIN to continue</p>
        </div>

        {students.length > 0 && (
          <div className="auth-field" style={{ marginBottom: 'var(--sp-4)', textAlign: 'left', width: '100%' }}>
            <label style={{ fontSize: 'var(--fs-caption)', fontWeight: 'bold', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--sp-1)' }}>Select Student Profile</label>
            <select
              className="auth-input"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              style={{ background: 'var(--color-surface-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', width: '100%', padding: 'var(--sp-2) var(--sp-3)', borderRadius: 'var(--radius-sm)' }}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="auth-pin-input">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`auth-pin-dot ${pin.length > i ? 'auth-pin-dot--filled' : ''}`}>
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        <div className="auth-numpad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) => (
            <button
              key={i}
              className={`auth-numpad-key ${key === null ? 'auth-numpad-key--empty' : ''}`}
              onClick={() => {
                if (key === 'del') setPin(p => p.slice(0, -1));
                else if (key !== null && pin.length < 4) setPin(p => p + key);
              }}
              disabled={key === null}
            >
              {key === 'del' ? '⌫' : key}
            </button>
          ))}
        </div>

        {error && <p className="auth-error">{error}</p>}

        <Button variant="primary" fullWidth onClick={handleLogin} disabled={pin.length < 4}>
          Login
        </Button>

        {import.meta.env.DEV && (
          <>
            <div className="auth-divider">
              <span>or</span>
            </div>

            <Button variant="secondary" fullWidth onClick={handleDemoLogin}>
              Quick Demo Login
            </Button>
          </>
        )}

        <p className="auth-switch">
          New student? <button onClick={() => navigate('/auth/student/signup')}>Sign up</button>
        </p>
      </div>
    </div>
  );
};

/* Student Signup */
export const StudentSignup: React.FC = () => {
  const navigate = useNavigate();
  const { loginStudent, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(7);
  const [board, setBoard] = useState<Board>('CBSE');
  const [language, setLanguage] = useState<Language>('en');
  const [avatarId, setAvatarId] = useState('owl');
  const [learningMode, setLearningMode] = useState<'solo' | 'classroom'>('solo');
  const [classCode, setClassCode] = useState('');
  const [classCodeError, setClassCodeError] = useState('');
  const [pin, setPin] = useState('');
  const [createdStudent, setCreatedStudent] = useState<{user: any, profile: any} | null>(null);

  const totalSteps = 6;

  const handleComplete = async () => {
    const user = {
      id: generateId(),
      role: 'student' as const,
      name,
      avatarId,
      language,
      theme: 'dark' as const,
      pin,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastLoginAt: Date.now(),
    };
    const profile = {
      userId: user.id,
      grade,
      board,
      learningStyle: undefined,
      difficultyLevel: 0.5,
      streakCurrent: 0,
      streakBest: 0,
      xpTotal: 0,
      level: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      learningMode,
      classCode: learningMode === 'classroom' ? classCode : undefined,
    };
    
    try {
      await db.users.put(user);
      await db.studentProfiles.put(profile);
      setCreatedStudent({ user, profile });
      setStep(7);
    } catch (err) {
      console.error('Failed to save student signup to IndexedDB', err);
      loginStudent(user, profile);
      navigate('/student');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {step < 7 && (
          <button className="auth-back-btn" onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/auth')}>
            <ArrowLeft size={18} />
          </button>
        )}

        {step <= 6 && (
          <div className="auth-progress">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`auth-progress-dot ${i < step ? 'auth-progress-dot--active' : ''}`} />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="auth-step animate-fade-in-up">
            <h2 className="auth-step-title">What's your name?</h2>
            <input
              className="auth-input"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Button variant="primary" fullWidth onClick={() => setStep(2)} disabled={!name.trim()}>
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="auth-step animate-fade-in-up">
            <h2 className="auth-step-title">Which grade are you in?</h2>
            <div className="auth-grade-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => (
                <button
                  key={g}
                  className={`auth-grade-btn ${grade === g ? 'auth-grade-btn--active' : ''}`}
                  onClick={() => setGrade(g)}
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="auth-select-group">
              <label>Board</label>
              <div className="auth-chip-group">
                {(['CBSE', 'ICSE'] as Board[]).map((b) => (
                  <button
                    key={b}
                    className={`auth-chip ${board === b ? 'auth-chip--active' : ''}`}
                    onClick={() => setBoard(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="primary" fullWidth onClick={() => setStep(3)}>Continue</Button>
          </div>
        )}

        {step === 3 && (
          <div className="auth-step animate-fade-in-up">
            <h2 className="auth-step-title">Choose learning mode</h2>
            <div className="auth-lang-options" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', width: '100%' }}>
              <button
                type="button"
                className={`auth-lang-card ${learningMode === 'solo' ? 'auth-lang-card--active' : ''}`}
                onClick={() => {
                  setLearningMode('solo');
                  setClassCodeError('');
                }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--sp-4)', width: '100%' }}
              >
                <span style={{ fontWeight: 'bold', fontSize: 'var(--fs-body)' }}>Solo Learning</span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-caption)', textAlign: 'left', marginTop: '4px' }}>Study at your own pace with personalized AI assistance.</span>
              </button>
              <button
                type="button"
                className={`auth-lang-card ${learningMode === 'classroom' ? 'auth-lang-card--active' : ''}`}
                onClick={() => setLearningMode('classroom')}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--sp-4)', width: '100%' }}
              >
                <span style={{ fontWeight: 'bold', fontSize: 'var(--fs-body)' }}>Join Classroom</span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-caption)', textAlign: 'left', marginTop: '4px' }}>Connect with your teacher, submit assignments, and view class doubts.</span>
              </button>
            </div>

            {learningMode === 'classroom' && (
              <div style={{ marginTop: 'var(--sp-4)', width: '100%', textAlign: 'left' }}>
                <label style={{ fontSize: 'var(--fs-caption)', fontWeight: 'bold', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--sp-1)' }}>Classroom Code</label>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Enter code (e.g. 7A-XR92K)"
                  value={classCode}
                  onChange={(e) => {
                    setClassCode(e.target.value.toUpperCase());
                    setClassCodeError('');
                  }}
                  style={{ textTransform: 'uppercase' }}
                />
                {classCodeError && <p style={{ color: 'var(--color-error)', fontSize: 'var(--fs-caption)', marginTop: 'var(--sp-1)' }}>{classCodeError}</p>}
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={async () => {
                if (learningMode === 'classroom') {
                  if (!classCode.trim()) {
                    setClassCodeError('Please enter a classroom code');
                    return;
                  }
                  const exists = await db.classrooms.get(classCode.trim());
                  if (!exists) {
                    setClassCodeError('Classroom code not found. Try 7A-XR92K or 10M-MA10M.');
                    return;
                  }
                }
                setStep(4);
              }}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="auth-step animate-fade-in-up">
            <h2 className="auth-step-title">Choose your language</h2>
            <div className="auth-lang-options">
              <button
                className={`auth-lang-card ${language === 'en' ? 'auth-lang-card--active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                <span className="auth-lang-icon"><Globe size={18} /></span>
                <span>English</span>
              </button>
              <button
                className={`auth-lang-card ${language === 'hi' ? 'auth-lang-card--active' : ''}`}
                onClick={() => setLanguage('hi')}
              >
                <span className="auth-lang-icon"><Globe size={18} /></span>
                <span>हिन्दी</span>
              </button>
            </div>
            <Button variant="primary" fullWidth onClick={() => setStep(5)}>Continue</Button>
          </div>
        )}

        {step === 5 && (
          <div className="auth-step animate-fade-in-up">
            <h2 className="auth-step-title">Choose your avatar</h2>
            <div className="auth-avatar-grid">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  className={`auth-avatar-btn ${avatarId === av.id ? 'auth-avatar-btn--active' : ''}`}
                  onClick={() => setAvatarId(av.id)}
                  style={{ borderColor: avatarId === av.id ? av.color : 'transparent' }}
                >
                  <span className="auth-avatar-icon" style={{ color: av.color, display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-1)' }}>
                    <AvatarIcon id={av.id} size={28} />
                  </span>
                  <span className="auth-avatar-name">{av.name}</span>
                </button>
              ))}
            </div>
            <Button variant="primary" fullWidth onClick={() => setStep(6)}>Continue</Button>
          </div>
        )}

        {step === 6 && (
          <div className="auth-step animate-fade-in-up">
            <h2 className="auth-step-title">Create a PIN</h2>
            <p className="auth-step-desc">You'll use this to log in next time</p>
            <div className="auth-pin-input">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`auth-pin-dot ${pin.length > i ? 'auth-pin-dot--filled' : ''}`}>
                  {pin.length > i ? '●' : ''}
                </div>
              ))}
            </div>
            <div className="auth-numpad auth-numpad--sm">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) => (
                <button
                  key={i}
                  className={`auth-numpad-key ${key === null ? 'auth-numpad-key--empty' : ''}`}
                  onClick={() => {
                    if (key === 'del') setPin(p => p.slice(0, -1));
                    else if (key !== null && pin.length < 4) setPin(p => p + key);
                  }}
                  disabled={key === null}
                >
                  {key === 'del' ? '⌫' : key}
                </button>
              ))}
            </div>
            <Button variant="primary" fullWidth onClick={handleComplete} disabled={pin.length < 4}>
              Start Learning
            </Button>
          </div>
        )}

        {step === 7 && createdStudent && (
          <div className="auth-step animate-fade-in-up" style={{ textAlign: 'center' }}>
            <h2 className="auth-step-title">Account Created! 🎉</h2>
            <p className="auth-step-desc" style={{ marginBottom: 'var(--sp-4)' }}>
              Here is your unique <strong>Parent Access Code</strong>. Your parent can use this code to log in and track your learning progress.
            </p>
            <div style={{
              background: 'var(--color-surface-bg)',
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--sp-4)',
              fontSize: 'var(--fs-h2)',
              fontWeight: 'bold',
              letterSpacing: '2px',
              color: 'var(--color-primary)',
              marginBottom: 'var(--sp-4)'
            }}>
              {createdStudent.user.id}
            </div>
            <p className="auth-step-desc" style={{ fontSize: 'var(--fs-caption)', marginBottom: 'var(--sp-4)' }}>
              Make sure to save this code. You can also view it anytime in your settings.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                loginStudent(createdStudent.user, createdStudent.profile);
                navigate('/student');
              }}
            >
              Enter Student Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

/* Teacher Login */
export const TeacherLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginTeacher, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      const existingUser = await db.users.where('email').equalsIgnoreCase(cleanEmail).first();
      if (existingUser && existingUser.role === 'teacher') {
        if (existingUser.password && existingUser.password !== password) {
          setError('Incorrect password. Please try again.');
          return;
        }
        const existingProfile = await db.teacherProfiles.get(existingUser.id);
        if (existingProfile) {
          loginTeacher(existingUser, existingProfile);
          navigate('/teacher');
          return;
        }
      }

      if (cleanEmail === 'priya.sharma@school.edu') {
        loginTeacher(DEMO_TEACHER.user, DEMO_TEACHER.profile);
        navigate('/teacher');
        return;
      }

      setError('Teacher account not found. Please sign up first.');
    } catch (err) {
      console.error('Teacher login failed', err);
      setError('An error occurred. Please try again.');
    }
  };

  const handleDemoLogin = () => {
    loginTeacher(DEMO_TEACHER.user, DEMO_TEACHER.profile);
    navigate('/teacher');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button className="auth-back-btn" onClick={() => navigate('/auth')}>
          <ArrowLeft size={18} />
        </button>

        <div className="auth-header">
          <h1 className="auth-title">Teacher Login</h1>
          <p className="auth-subtitle">Access your classroom dashboard</p>
        </div>

        <div className="auth-form">
          <div className="auth-field">
            <label>Email</label>
            <div className="auth-input-wrap">
              <Mail size={18} className="auth-input-icon" />
              <input
                className="auth-input auth-input--icon"
                type="email"
                placeholder="teacher@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-input-icon" />
              <input
                className="auth-input auth-input--icon"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="auth-input-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <Button variant="primary" fullWidth onClick={handleLogin}>
            Login
          </Button>

          {import.meta.env.DEV && (
            <>
              <div className="auth-divider"><span>or</span></div>

              <Button variant="secondary" fullWidth onClick={handleDemoLogin}>
                Quick Demo Login
              </Button>
            </>
          )}
        </div>

        <p className="auth-switch">
          New teacher? <button onClick={() => navigate('/auth/teacher/signup')}>Sign up</button>
        </p>
      </div>
    </div>
  );
};

/* Teacher Signup */
export const TeacherSignup: React.FC = () => {
  const navigate = useNavigate();
  const { loginTeacher, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !schoolCode.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const teacherId = generateId();
    const generatedCode = `${schoolCode.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

    const newUser = {
      id: teacherId,
      role: 'teacher' as const,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatarId: 'star',
      language: 'en' as const,
      theme: 'dark' as const,
      password: password.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastLoginAt: Date.now()
    };

    const newProfile = {
      userId: teacherId,
      schoolCode: schoolCode.trim().toUpperCase(),
      schoolName: `${schoolCode.trim().toUpperCase()} School`,
      subjects: ['cbse-10-math', 'cbse-10-science'],
      grades: [10],
      isVerified: true,
      activeClassroomCode: generatedCode
    };

    const newClassroom = {
      id: generatedCode,
      name: `Class 10 - ${name.split(' ')[0]}`,
      teacherId: teacherId,
      grade: 10,
      createdAt: Date.now()
    };

    try {
      await db.users.put(newUser);
      await db.teacherProfiles.put(newProfile);
      await db.classrooms.put(newClassroom);
      loginTeacher(newUser, newProfile);
      navigate('/teacher');
    } catch (err) {
      console.error('Failed to register teacher', err);
      setError('An error occurred during registration. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button className="auth-back-btn" onClick={() => navigate('/auth')}>
          <ArrowLeft size={18} />
        </button>

        <div className="auth-header">
          <h1 className="auth-title">Teacher Sign Up</h1>
          <p className="auth-subtitle">Create your professional account</p>
        </div>

        <div className="auth-form">
          <div className="auth-field">
            <label>Full Name</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="teacher@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label>School Code</label>
            <input
              className="auth-input"
              type="text"
              placeholder="e.g. DPS-001"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <Button variant="primary" fullWidth onClick={handleSignup}>
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
};

/* Parent Login */
export const ParentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginParent, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  const [parentCode, setParentCode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const cleanCode = parentCode.trim();
    if (!cleanCode) {
      setError('Please enter a parent access code.');
      return;
    }

    try {
      const student = await db.users.get(cleanCode);
      if (student && student.role === 'student') {
        localStorage.setItem('parent_active_child_id', student.id);
        const parentUser = {
          id: generateId(),
          role: 'parent' as const,
          name: `${student.name}'s Parent`,
          avatarId: 'tree',
          language: 'en' as const,
          theme: 'dark' as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        loginParent(parentUser);
        navigate('/parent');
      } else {
        setError("Invalid access code. Please check the code in your child's settings.");
      }
    } catch (err) {
      console.error('Failed to validate parent access code', err);
      setError('An error occurred. Please try again.');
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem('parent_active_child_id', DEMO_STUDENT.user.id);
    const parentUser = {
      id: generateId(),
      role: 'parent' as const,
      name: `${DEMO_STUDENT.user.name}'s Parent`,
      avatarId: 'tree',
      language: 'en' as const,
      theme: 'dark' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    loginParent(parentUser);
    navigate('/parent');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button className="auth-back-btn" onClick={() => navigate('/auth')}>
          <ArrowLeft size={18} />
        </button>

        <div className="auth-header">
          <h1 className="auth-title">Parent Access</h1>
          <p className="auth-subtitle">Enter your child's parent access code to continue</p>
        </div>

        <div className="auth-field" style={{ marginBottom: 'var(--sp-4)', textAlign: 'left', width: '100%' }}>
          <label style={{ fontSize: 'var(--fs-caption)', fontWeight: 'bold', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--sp-1)' }}>Parent Access Code</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Enter child's access code (e.g. usr-abc123xy)"
            value={parentCode}
            onChange={(e) => {
              setParentCode(e.target.value);
              setError('');
            }}
          />
          {error && <p style={{ color: 'var(--color-error)', fontSize: 'var(--fs-caption)', marginTop: 'var(--sp-1)' }}>{error}</p>}
        </div>

        <Button variant="primary" fullWidth onClick={handleLogin} disabled={!parentCode.trim()}>
          View Dashboard
        </Button>

        {import.meta.env.DEV && (
          <>
            <div className="auth-divider"><span>or</span></div>

            <Button variant="secondary" fullWidth onClick={handleDemoLogin}>
              Quick Demo Access
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
