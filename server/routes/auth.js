import { Router } from 'express';
import { runSQL, getOne } from '../db.js';
import { hashPassword, isPasswordHash, verifyPassword, withoutPassword } from '../authUtils.js';

const router = Router();

// Student Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, password, name, age, grade, board, goals, level, study_time, language, device_type, connectivity, class_code } = req.body;
    const normalizedUsername = username?.trim();
    
    if (!normalizedUsername || !password || !name?.trim()) {
      return res.status(400).json({ error: 'Username, password, and name are required' });
    }

    // Check if username exists
    const existing = await getOne('SELECT id FROM students WHERE username = ?', [normalizedUsername]);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const passwordHash = await hashPassword(password);
    const result = await runSQL(
      `INSERT INTO students (username, password, name, age, grade, board, goals, level, study_time, language, device_type, connectivity, class_code, last_active_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [normalizedUsername, passwordHash, name.trim(), age || null, grade || null, board || 'CBSE', goals || 'Math', level || 'beginner', study_time || '30 min', language || 'en', device_type || 'mobile', connectivity || '3g', class_code || '']
    );

    const student = await getOne('SELECT * FROM students WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(withoutPassword(student));
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Student Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = username?.trim();
    if (!normalizedUsername || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const student = await getOne('SELECT * FROM students WHERE username = ?', [normalizedUsername]);
    if (!student || !(await verifyPassword(password, student.password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (!isPasswordHash(student.password)) {
      await runSQL('UPDATE students SET password = ? WHERE id = ?', [await hashPassword(password), student.id]);
    }

    // Update last active
    await runSQL("UPDATE students SET last_active_date = datetime('now') WHERE id = ?", [student.id]);
    await runSQL('INSERT INTO sessions (student_id) VALUES (?)', [student.id]);

    res.json(withoutPassword(student));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Teacher Signup
router.post('/teacher/signup', async (req, res) => {
  try {
    const { username, password, name, class_code, school } = req.body;
    const normalizedUsername = username?.trim();
    if (!normalizedUsername || !password || !name?.trim() || !class_code?.trim()) {
      return res.status(400).json({ error: 'Username, password, name, and class code are required' });
    }

    const existing = await getOne('SELECT id FROM teachers WHERE username = ?', [normalizedUsername]);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const passwordHash = await hashPassword(password);
    await runSQL(
      'INSERT INTO teachers (username, password, name, class_code, school) VALUES (?, ?, ?, ?, ?)',
      [normalizedUsername, passwordHash, name.trim(), class_code.trim().toUpperCase(), school || '']
    );

    res.status(201).json({ success: true, class_code });
  } catch (err) {
    console.error('Teacher signup error:', err);
    res.status(500).json({ error: 'Teacher signup failed' });
  }
});

// Teacher Login
router.post('/teacher/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = username?.trim();
    if (!normalizedUsername || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const teacher = await getOne('SELECT * FROM teachers WHERE username = ?', [normalizedUsername]);
    if (!teacher || !(await verifyPassword(password, teacher.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!isPasswordHash(teacher.password)) {
      await runSQL('UPDATE teachers SET password = ? WHERE id = ?', [await hashPassword(password), teacher.id]);
    }

    res.json({ id: teacher.id, name: teacher.name, class_code: teacher.class_code, school: teacher.school, authenticated: true });
  } catch (err) {
    console.error('Teacher login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
