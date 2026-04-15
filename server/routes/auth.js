import express from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db/index.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { UnauthorizedError, ValidationError, NotFoundError } from '../middleware/errorHandler.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const result = await query(
      'SELECT id, email, password_hash, name, department, role, avatar_url FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          department: user.department,
          role: user.role,
          avatarUrl: user.avatar_url
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, name, department, role, avatar_url FROM users WHERE id = $1 AND deleted_at IS NULL',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register (admin only in production)
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, department } = req.body;

    if (!email || !password || !name) {
      throw new ValidationError('Email, password, and name are required');
    }

    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new ValidationError('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (email, password_hash, name, department) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, department, role, avatar_url`,
      [email, passwordHash, name, department || null]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          department: user.department,
          role: user.role,
          avatarUrl: user.avatar_url
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  // In a stateless JWT setup, logout is handled client-side
  res.json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
});

export default router;