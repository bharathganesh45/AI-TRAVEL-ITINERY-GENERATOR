import { dbAll, dbGet, dbRun } from '../config/db.js';
import crypto from 'crypto';

export const tripModel = {
  create: async ({ user_id, title, destination, trip_type = 'Leisure', start_date = null, end_date = null, duration_days = 6, travelers_count = 2, status = 'Draft' }) => {
    const id = crypto.randomUUID();
    await dbRun(
      `INSERT INTO trips (id, user_id, title, destination, trip_type, start_date, end_date, duration_days, travelers_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user_id, title, destination, trip_type, start_date, end_date, Number(duration_days) || 6, Number(travelers_count) || 2, status]
    );
    return tripModel.findById(id, user_id);
  },

  findAllByUser: async (user_id, search = '') => {
    if (search) {
      const pattern = `%${search}%`;
      return await dbAll(
        `SELECT * FROM trips WHERE user_id = ? AND (title LIKE ? OR destination LIKE ?) ORDER BY created_at DESC`,
        [user_id, pattern, pattern]
      );
    }
    return await dbAll(`SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC`, [user_id]);
  },

  findById: async (id, user_id = null) => {
    if (user_id) {
      return await dbGet(`SELECT * FROM trips WHERE id = ? AND user_id = ?`, [id, user_id]);
    }
    return await dbGet(`SELECT * FROM trips WHERE id = ?`, [id]);
  },

  update: async (id, user_id, fields = {}) => {
    const allowed = [
      'title',
      'destination',
      'trip_type',
      'start_date',
      'end_date',
      'duration_days',
      'travelers_count',
      'status',
    ];
    const updates = [];
    const params = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(key === 'duration_days' || key === 'travelers_count' ? Number(fields[key]) : fields[key]);
      }
    }

    if (updates.length === 0) {
      return tripModel.findById(id, user_id);
    }

    updates.push('updated_at = NOW()');
    params.push(id, user_id);
    await dbRun(
      `UPDATE trips SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );
    return tripModel.findById(id, user_id);
  },

  delete: async (id, user_id) => {
    try {
      await dbRun(
        `DELETE FROM booking_information WHERE document_id IN (SELECT id FROM documents WHERE trip_id = ?)`,
        [id]
      );
    } catch (e) {}
    try { await dbRun(`DELETE FROM documents WHERE trip_id = ?`, [id]); } catch (e) {}
    try { await dbRun(`DELETE FROM itineraries WHERE trip_id = ?`, [id]); } catch (e) {}
    try { await dbRun(`DELETE FROM share_links WHERE trip_id = ?`, [id]); } catch (e) {}
    if (user_id) {
      return await dbRun(`DELETE FROM trips WHERE id = ? AND user_id = ?`, [id, user_id]);
    }
    return await dbRun(`DELETE FROM trips WHERE id = ?`, [id]);
  },

  getStatsByUser: async (user_id) => {
    const totalTrips = (await dbGet(`SELECT COUNT(*) as count FROM trips WHERE user_id = ?`, [user_id]))?.count || 0;
    const totalDocs = (await dbGet(
      `SELECT COUNT(*) as count FROM documents d JOIN trips t ON d.trip_id = t.id WHERE t.user_id = ?`,
      [user_id]
    ))?.count || 0;
    const generatedItineraries = (await dbGet(
      `SELECT COUNT(*) as count FROM itineraries i JOIN trips t ON i.trip_id = t.id WHERE t.user_id = ?`,
      [user_id]
    ))?.count || 0;
    return { totalTrips, totalDocs, generatedItineraries };
  }
};

export default tripModel;
