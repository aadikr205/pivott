const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const { sendVerificationOtpEmail } = require('../email-service');
const { logActivity } = require('../activity-logger');

// Uploads directory for user profile photos
const UPLOADS_DIR = path.join(__dirname, '../public/uploads/profiles');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Feature 2: Strict password validation
 * 1. Minimum 8 characters.
 * 2. First character must be an uppercase letter (A-Z).
 * 3. Must contain at least one number (0-9).
 * 4. Must contain at least one special symbol (@ # $ % ^ & * ! ? _ - etc.).
 */
function validatePassword(password) {
  const errors = [];
  if (!password || typeof password !== 'string') {
    return ['Password is required.'];
  }
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (!/^[A-Z]/.test(password)) {
    errors.push('First character must be an uppercase letter (A-Z).');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9).');
  }
  if (!/[@#$%^&*!?_\-+=~|\\/;:,.]/.test(password)) {
    errors.push('Password must contain at least one special symbol (@ # $ % ^ & * ! ? etc.).');
  }
  return errors;
}

// ==========================================
// FEATURE 1: EMAIL OTP SIGNUP VERIFICATION
// ==========================================

// POST /auth/signup/send-otp
// Validates details, generates 6-digit OTP, hashes it, sends email, stores attempt
router.post('/signup/send-otp', async (req, res) => {
  try {
    const { name, email, password, exam_name, exam_date, max_daily_hours, off_days } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already registered in users
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Feature 2: Validate password rules
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        error: passwordErrors[0],
        all_errors: passwordErrors
      });
    }

    // Rate-limit cooldown: check if OTP was sent recently (< 45s ago)
    const existingVerification = db.prepare('SELECT * FROM signup_verifications WHERE email = ?').get(cleanEmail);
    if (existingVerification) {
      const timeSinceCreated = Date.now() - new Date(existingVerification.created_at).getTime();
      if (timeSinceCreated < 45000) {
        const remainingSec = Math.ceil((45000 - timeSinceCreated) / 1000);
        return res.status(429).json({
          error: `Please wait ${remainingSec}s before requesting a new code.`,
          cooldownRemainingSec: remainingSec
        });
      }
    }

    // Generate 6-digit random numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = bcrypt.hashSync(otp, 10);
    const passwordHash = bcrypt.hashSync(password, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry
    const now = new Date().toISOString();

    const signupPayload = JSON.stringify({
      name: name.trim(),
      password_hash: passwordHash,
      exam_name: exam_name || 'Competitive Exam',
      exam_date: exam_date || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      max_daily_hours: Number(max_daily_hours) || 6.0,
      off_days: off_days || [0]
    });

    // Upsert verification record
    db.prepare(`
      INSERT INTO signup_verifications (email, otp_hash, signup_data, expires_at, attempt_count, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
      ON CONFLICT(email) DO UPDATE SET
        otp_hash = excluded.otp_hash,
        signup_data = excluded.signup_data,
        expires_at = excluded.expires_at,
        attempt_count = 0,
        created_at = excluded.created_at
    `).run(cleanEmail, otpHash, signupPayload, expiresAt, now);

    // Send email via Nodemailer transactional service
    const emailResult = await sendVerificationOtpEmail(cleanEmail, otp, name.trim());

    return res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      email: cleanEmail,
      expires_in_minutes: 10,
      dev_otp: emailResult.isDevFallback ? otp : undefined
    });
  } catch (err) {
    console.error('[Auth] Send OTP error:', err);
    return res.status(500).json({ error: 'Failed to send verification code. Please try again.' });
  }
});

// POST /auth/signup/verify-otp
// Validates entered 6-digit code, enforces max 5 attempts, creates verified user
router.post('/signup/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const record = db.prepare('SELECT * FROM signup_verifications WHERE email = ?').get(cleanEmail);
    if (!record) {
      return res.status(400).json({ error: 'No verification in progress for this email. Please sign up again.' });
    }

    // Check expiry
    if (new Date(record.expires_at).getTime() < Date.now()) {
      db.prepare('DELETE FROM signup_verifications WHERE email = ?').run(cleanEmail);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    // Check wrong attempt limits (max 5 attempts)
    if (record.attempt_count >= 5) {
      db.prepare('DELETE FROM signup_verifications WHERE email = ?').run(cleanEmail);
      return res.status(400).json({
        error: 'Too many incorrect attempts. This code has been invalidated. Please request a new one.'
      });
    }

    // Compare hash
    const isValid = bcrypt.compareSync(cleanOtp, record.otp_hash);
    if (!isValid) {
      const newAttempts = record.attempt_count + 1;
      db.prepare('UPDATE signup_verifications SET attempt_count = ? WHERE email = ?').run(newAttempts, cleanEmail);
      const remaining = 5 - newAttempts;
      if (remaining <= 0) {
        db.prepare('DELETE FROM signup_verifications WHERE email = ?').run(cleanEmail);
        return res.status(400).json({
          error: 'Too many incorrect attempts. This code has been invalidated. Please request a new one.'
        });
      }
      return res.status(400).json({
        error: `Incorrect verification code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`
      });
    }

    // OTP Valid! Create User in Database
    const signupData = JSON.parse(record.signup_data);
    const userId = uuidv4();
    const now = new Date().toISOString();

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, exam_name, exam_date, max_daily_hours, off_days, buffer_days_percent, created_at, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    insertUser.run(
      userId,
      signupData.name,
      cleanEmail,
      signupData.password_hash,
      signupData.exam_name,
      signupData.exam_date,
      signupData.max_daily_hours,
      JSON.stringify(signupData.off_days),
      0.10,
      now
    );

    // Clean up verification record
    db.prepare('DELETE FROM signup_verifications WHERE email = ?').run(cleanEmail);

    // Feature 7: Log permanent activity
    logActivity(userId, 'auth', `Account created & email verified (${cleanEmail})`, {
      exam_name: signupData.exam_name
    });

    const token = jwt.sign({ id: userId, email: cleanEmail }, JWT_SECRET, { expiresIn: '30d' });

    const user = db.prepare(`
      SELECT id, name, email, exam_name, exam_date, max_daily_hours, off_days, created_at, is_verified, profile_photo_url 
      FROM users WHERE id = ?
    `).get(userId);
    user.off_days = JSON.parse(user.off_days || '[0]');

    return res.status(201).json({
      success: true,
      message: 'Email successfully verified!',
      token,
      user
    });
  } catch (err) {
    console.error('[Auth] Verify OTP error:', err);
    return res.status(500).json({ error: 'Failed to verify code.' });
  }
});

// POST /auth/signup/resend-otp
router.post('/signup/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = db.prepare('SELECT * FROM signup_verifications WHERE email = ?').get(cleanEmail);
    if (!record) {
      return res.status(400).json({ error: 'No signup in progress for this email.' });
    }

    // Cooldown check
    const timeSinceCreated = Date.now() - new Date(record.created_at).getTime();
    if (timeSinceCreated < 45000) {
      const remainingSec = Math.ceil((45000 - timeSinceCreated) / 1000);
      return res.status(429).json({
        error: `Please wait ${remainingSec}s before requesting a new code.`,
        cooldownRemainingSec: remainingSec
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = bcrypt.hashSync(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE signup_verifications
      SET otp_hash = ?, expires_at = ?, attempt_count = 0, created_at = ?
      WHERE email = ?
    `).run(otpHash, expiresAt, now, cleanEmail);

    const signupData = JSON.parse(record.signup_data);
    const emailResult = await sendVerificationOtpEmail(cleanEmail, otp, signupData.name);

    return res.json({
      success: true,
      message: `A fresh 6-digit verification code has been sent to ${cleanEmail}.`,
      expires_in_minutes: 10,
      dev_otp: emailResult.isDevFallback ? otp : undefined
    });
  } catch (err) {
    console.error('[Auth] Resend OTP error:', err);
    return res.status(500).json({ error: 'Failed to resend code.' });
  }
});

// Direct legacy signup fallback (for demo accounts or automated seeding)
router.post('/signup', (req, res) => {
  try {
    const { name, email, password, exam_name, exam_date, max_daily_hours, off_days } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Validate password rules
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        error: passwordErrors[0],
        all_errors: passwordErrors
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const userId = uuidv4();
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, exam_name, exam_date, max_daily_hours, off_days, buffer_days_percent, created_at, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    insert.run(
      userId,
      name.trim(),
      cleanEmail,
      password_hash,
      exam_name || 'Competitive Exam',
      exam_date || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      Number(max_daily_hours) || 6.0,
      JSON.stringify(off_days || [0]),
      0.10,
      now
    );

    // Feature 7: Log permanent activity
    logActivity(userId, 'auth', `Account created via instant signup (${cleanEmail})`);

    const token = jwt.sign({ id: userId, email: cleanEmail }, JWT_SECRET, { expiresIn: '30d' });

    const user = db.prepare(`
      SELECT id, name, email, exam_name, exam_date, max_daily_hours, off_days, created_at, is_verified, profile_photo_url 
      FROM users WHERE id = ?
    `).get(userId);
    user.off_days = JSON.parse(user.off_days || '[0]');

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
});

// POST /auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Feature 7: Log permanent activity
    logActivity(user.id, 'auth', `Student logged in (${user.email})`);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      exam_name: user.exam_name,
      exam_date: user.exam_date,
      max_daily_hours: user.max_daily_hours,
      off_days: JSON.parse(user.off_days || '[0]'),
      created_at: user.created_at,
      is_verified: user.is_verified,
      profile_photo_url: user.profile_photo_url
    };

    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to log in.' });
  }
});

// GET /auth/me
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, exam_name, exam_date, max_daily_hours, off_days, created_at, is_verified, profile_photo_url 
      FROM users WHERE id = ?
    `).get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    user.off_days = JSON.parse(user.off_days || '[0]');
    return res.json({ user });
  } catch (err) {
    console.error('Auth check error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

// ==========================================
// FEATURE 5: PROFILE PHOTO & AVATAR API
// ==========================================

// POST /auth/profile-photo
// Accepts base64 image data URL (max 5MB), saves file, updates user record
router.post('/profile-photo', authMiddleware, (req, res) => {
  try {
    const rawImage = req.body.imageBase64 || req.body.photo_base64;
    if (!rawImage || typeof rawImage !== 'string') {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    // Check size limit (~5MB max)
    const base64Data = rawImage.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image size exceeds maximum allowed limit of 5MB.' });
    }

    let photoUrl = rawImage;
    try {
      // Save image to static uploads directory if folder exists/accessible
      const fileName = `profile_${req.user.id}_${Date.now()}.png`;
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      const filePath = path.join(UPLOADS_DIR, fileName);
      fs.writeFileSync(filePath, buffer);
      photoUrl = `/uploads/profiles/${fileName}`;
    } catch (e) {
      // Fallback: store base64 directly
      photoUrl = rawImage;
    }

    // Update in database
    db.prepare('UPDATE users SET profile_photo_url = ? WHERE id = ?').run(photoUrl, req.user.id);

    // Feature 7: Log permanent activity
    logActivity(req.user.id, 'profile', 'Uploaded custom profile photo', { photoUrl });

    const updatedUser = db.prepare(`
      SELECT id, name, email, exam_name, exam_date, max_daily_hours, off_days, created_at, is_verified, profile_photo_url 
      FROM users WHERE id = ?
    `).get(req.user.id);
    if (updatedUser) {
      updatedUser.off_days = JSON.parse(updatedUser.off_days || '[0]');
    }

    return res.json({
      success: true,
      profile_photo_url: photoUrl,
      user: updatedUser
    });
  } catch (err) {
    console.error('[Auth] Profile photo upload error:', err);
    return res.status(500).json({ error: 'Failed to update profile photo.' });
  }
});

// POST /auth/default-avatar
// Selects one of preset avatar choices
router.post('/default-avatar', authMiddleware, (req, res) => {
  try {
    let avatarUrl = req.body.avatarUrl || req.body.avatar_url;
    if (!avatarUrl && req.body.avatar_id) {
      avatarUrl = `avatar:${req.body.avatar_id.replace(/^avatar:/, '')}`;
    }

    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return res.status(400).json({ error: 'Avatar selection is required.' });
    }

    db.prepare('UPDATE users SET profile_photo_url = ? WHERE id = ?').run(avatarUrl, req.user.id);

    // Feature 7: Log permanent activity
    logActivity(req.user.id, 'profile', `Changed default avatar (${avatarUrl})`, { avatarUrl });

    const updatedUser = db.prepare(`
      SELECT id, name, email, exam_name, exam_date, max_daily_hours, off_days, created_at, is_verified, profile_photo_url 
      FROM users WHERE id = ?
    `).get(req.user.id);
    if (updatedUser) {
      updatedUser.off_days = JSON.parse(updatedUser.off_days || '[0]');
    }

    return res.json({
      success: true,
      profile_photo_url: avatarUrl,
      user: updatedUser
    });
  } catch (err) {
    console.error('[Auth] Default avatar error:', err);
    return res.status(500).json({ error: 'Failed to update avatar.' });
  }
});

// GET /auth/auto-login
// 1-Click instant login for phone users scanning QR codes
router.get('/auto-login', (req, res) => {
  try {
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get('student@pivott.app');
    if (!user) {
      user = db.prepare('SELECT * FROM users ORDER BY created_at ASC LIMIT 1').get();
    }
    if (!user) {
      return res.redirect('/');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    const safeToken = encodeURIComponent(token);

    // Feature 7: Log activity
    logActivity(user.id, 'auth', '1-Click QR Auto-Login used');

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Logging in to Pivott...</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 16px; text-align: center; }
    .card { background: #1e293b; padding: 2.25rem 1.75rem; border-radius: 1.5rem; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); max-width: 360px; width: 100%; }
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #14b8a6; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: white; border-radius: 12px; font-weight: 700; font-size: 0.95rem; text-decoration: none; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4); }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h3 style="margin:0 0 8px; font-size: 1.25rem; font-weight: bold; color: #fff;">Logging in to Pivott</h3>
    <p style="margin:0 0 12px; font-size: 0.9rem; color: #94a3b8;">Welcome, <strong>${user.name}</strong> (${user.exam_name})</p>
    <a id="go-btn" class="btn" href="/?token=${safeToken}">Enter App &rarr;</a>
  </div>
  <script>
    try {
      localStorage.setItem('pivott_token', ${JSON.stringify(token)});
      sessionStorage.setItem('pivott_token', ${JSON.stringify(token)});
    } catch(e) {}
    setTimeout(function() {
      window.location.href = '/?token=' + ${JSON.stringify(safeToken)};
    }, 120);
  </script>
</body>
</html>`);
  } catch (err) {
    console.error('Auto-login error:', err);
    res.redirect('/');
  }
});

module.exports = router;
