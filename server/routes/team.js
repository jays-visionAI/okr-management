import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(authenticateToken);

// GET /api/team
router.get('/', async (req, res, next) => {
  try {
    let sql = `
      SELECT t.*, u.name as manager_name,
             (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
      FROM teams t
      LEFT JOIN users u ON t.manager_id = u.id
      WHERE t.deleted_at IS NULL
    `;

    // If user is not manager/admin, show only their teams
    if (!['admin', 'manager'].includes(req.user.role)) {
      sql = `
        SELECT t.*, u.name as manager_name,
               (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
        FROM teams t
        LEFT JOIN users u ON t.manager_id = u.id
        INNER JOIN team_members tm ON t.id = tm.team_id
        WHERE t.deleted_at IS NULL AND tm.user_id = $1
      `;
      const result = await query(sql, [req.user.id]);
      return res.json({ success: true, data: result.rows });
    }

    const result = await query(sql);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/team/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const teamResult = await query(`
      SELECT t.*, u.name as manager_name
      FROM teams t
      LEFT JOIN users u ON t.manager_id = u.id
      WHERE t.id = $1 AND t.deleted_at IS NULL
    `, [id]);

    if (teamResult.rows.length === 0) {
      throw new NotFoundError('Team');
    }

    const membersResult = await query(`
      SELECT tm.*, u.name, u.email, u.department, u.avatar_url
      FROM team_members tm
      LEFT JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = $1
      ORDER BY tm.role DESC, tm.joined_at ASC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...teamResult.rows[0],
        members: membersResult.rows
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/team (admin/manager only)
router.post('/', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      throw new ValidationError('Team name is required');
    }

    const result = await query(`
      INSERT INTO teams (name, description, manager_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description, req.user.id]);

    // Add manager as team member
    await query(`
      INSERT INTO team_members (team_id, user_id, role)
      VALUES ($1, $2, 'manager')
    `, [result.rows[0].id, req.user.id]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/team/:id (admin/manager only)
router.put('/:id', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, managerId } = req.body;

    const result = await query(`
      UPDATE teams 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          manager_id = COALESCE($3, manager_id)
      WHERE id = $4 AND deleted_at IS NULL
      RETURNING *
    `, [name, description, managerId, id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Team');
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/team/:id/members (admin/manager only)
router.post('/:id/members', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    // Check if team exists
    const teamResult = await query(
      'SELECT id FROM teams WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (teamResult.rows.length === 0) {
      throw new NotFoundError('Team');
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );
    if (userResult.rows.length === 0) {
      throw new NotFoundError('User');
    }

    const result = await query(`
      INSERT INTO team_members (team_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (team_id, user_id) DO UPDATE SET role = $3
      RETURNING *
    `, [id, userId, role || 'member']);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/team/:id/members/:userId
router.delete('/:id/members/:userId', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const result = await query(`
      DELETE FROM team_members 
      WHERE team_id = $1 AND user_id = $2
      RETURNING id
    `, [id, userId]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Team member');
    }

    res.json({
      success: true,
      data: { message: 'Member removed from team' }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/team/:id/okr-summary
router.get('/:id/okr-summary', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        o.id,
        o.title,
        o.status,
        o.period,
        (SELECT COALESCE(AVG(
          CASE 
            WHEN kr.metric_type = 'percentage' THEN kr.current_value
            WHEN kr.metric_type = 'number' AND kr.target_value > 0 THEN (kr.current_value / kr.target_value) * 100
            ELSE 0
          END
        ), 0) FROM key_results kr WHERE kr.objective_id = o.id AND kr.deleted_at IS NULL) as progress
      FROM objectives o
      WHERE o.team_id = $1 AND o.deleted_at IS NULL
      ORDER BY o.created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
});

export default router;