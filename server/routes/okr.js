import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/okr/objectives
router.get('/objectives', async (req, res, next) => {
  try {
    const { period, teamId, ownerId, status } = req.query;
    
    let sql = `
      SELECT o.*, u.name as owner_name, u.avatar_url as owner_avatar,
             t.name as team_name,
             (SELECT COUNT(*) FROM key_results kr WHERE kr.objective_id = o.id AND kr.deleted_at IS NULL) as kr_count,
             (SELECT COALESCE(AVG(
               CASE 
                 WHEN kr.metric_type = 'percentage' THEN kr.current_value
                 WHEN kr.metric_type = 'number' AND kr.target_value > 0 THEN (kr.current_value / kr.target_value) * 100
                 ELSE 0
               END
             ), 0) FROM key_results kr WHERE kr.objective_id = o.id AND kr.deleted_at IS NULL) as progress
      FROM objectives o
      LEFT JOIN users u ON o.owner_id = u.id
      LEFT JOIN teams t ON o.team_id = t.id
      WHERE o.deleted_at IS NULL
    `;
    
    const params = [];
    let paramIndex = 1;

    if (period) {
      sql += ` AND o.period = $${paramIndex++}`;
      params.push(period);
    }
    if (teamId) {
      sql += ` AND o.team_id = $${paramIndex++}`;
      params.push(teamId);
    }
    if (ownerId) {
      sql += ` AND o.owner_id = $${paramIndex++}`;
      params.push(ownerId);
    }
    if (status) {
      sql += ` AND o.status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ' ORDER BY o.created_at DESC';

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
      meta: { count: result.rows.length }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/okr/objectives/:id
router.get('/objectives/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const objectiveResult = await query(`
      SELECT o.*, u.name as owner_name, u.avatar_url as owner_avatar,
             t.name as team_name
      FROM objectives o
      LEFT JOIN users u ON o.owner_id = u.id
      LEFT JOIN teams t ON o.team_id = t.id
      WHERE o.id = $1 AND o.deleted_at IS NULL
    `, [id]);

    if (objectiveResult.rows.length === 0) {
      throw new NotFoundError('Objective');
    }

    const keyResultsResult = await query(`
      SELECT kr.*, u.name as assignee_name, u.avatar_url as assignee_avatar
      FROM key_results kr
      LEFT JOIN users u ON kr.assignee_id = u.id
      WHERE kr.objective_id = $1 AND kr.deleted_at IS NULL
      ORDER BY kr.created_at ASC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...objectiveResult.rows[0],
        keyResults: keyResultsResult.rows
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/okr/objectives
router.post('/objectives', async (req, res, next) => {
  try {
    const { title, description, teamId, parentObjectiveId, period, startDate, endDate } = req.body;

    if (!title || !period || !startDate || !endDate) {
      throw new ValidationError('Title, period, start date, and end date are required');
    }

    const result = await query(`
      INSERT INTO objectives (title, description, owner_id, team_id, parent_objective_id, period, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [title, description, req.user.id, teamId, parentObjectiveId, period, startDate, endDate]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/okr/objectives/:id
router.put('/objectives/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, teamId, period, startDate, endDate, status } = req.body;

    const checkResult = await query(
      'SELECT id FROM objectives WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      throw new NotFoundError('Objective');
    }

    const result = await query(`
      UPDATE objectives 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          team_id = COALESCE($3, team_id),
          period = COALESCE($4, period),
          start_date = COALESCE($5, start_date),
          end_date = COALESCE($6, end_date),
          status = COALESCE($7, status)
      WHERE id = $8 AND owner_id = $9
      RETURNING *
    `, [title, description, teamId, period, startDate, endDate, status, id, req.user.id]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/okr/objectives/:id
router.delete('/objectives/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(`
      UPDATE objectives 
      SET deleted_at = NOW()
      WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL
      RETURNING id
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Objective');
    }

    res.json({
      success: true,
      data: { message: 'Objective deleted successfully' }
    });
  } catch (err) {
    next(err);
  }
});

// === Key Results ===

// POST /api/okr/objectives/:id/key-results
router.post('/objectives/:id/key-results', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, metricType, startValue, targetValue, unit, assigneeId } = req.body;

    if (!title || !metricType || targetValue === undefined) {
      throw new ValidationError('Title, metric type, and target value are required');
    }

    const objectiveResult = await query(
      'SELECT id FROM objectives WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (objectiveResult.rows.length === 0) {
      throw new NotFoundError('Objective');
    }

    const result = await query(`
      INSERT INTO key_results (objective_id, title, description, metric_type, start_value, target_value, unit, assignee_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [id, title, description, metricType, startValue || 0, targetValue, unit, assigneeId]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/okr/key-results/:id
router.put('/key-results/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentValue, status } = req.body;

    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    if (currentValue !== undefined) {
      updateFields.push(`current_value = $${paramIndex++}`);
      params.push(currentValue);
    }
    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (updateFields.length === 0) {
      throw new ValidationError('No fields to update');
    }

    params.push(id);
    const result = await query(`
      UPDATE key_results 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `, params);

    if (result.rows.length === 0) {
      throw new NotFoundError('Key Result');
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/okr/key-results/:id/progress
router.post('/key-results/:id/progress', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, comment } = req.body;

    if (value === undefined) {
      throw new ValidationError('Value is required');
    }

    // Update key result current value
    const krResult = await query(`
      UPDATE key_results 
      SET current_value = $1
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
    `, [value, id]);

    if (krResult.rows.length === 0) {
      throw new NotFoundError('Key Result');
    }

    // Record progress update
    const progressResult = await query(`
      INSERT INTO progress_updates (key_result_id, user_id, value, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, req.user.id, value, comment]);

    res.json({
      success: true,
      data: {
        keyResult: krResult.rows[0],
        progress: progressResult.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/okr/key-results/:id/history
router.get('/key-results/:id/history', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT pu.*, u.name as user_name
      FROM progress_updates pu
      LEFT JOIN users u ON pu.user_id = u.id
      WHERE pu.key_result_id = $1
      ORDER BY pu.created_at DESC
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