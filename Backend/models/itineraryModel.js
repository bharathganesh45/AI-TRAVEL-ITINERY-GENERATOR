import { dbAll, dbGet, dbRun } from '../config/db.js';
import crypto from 'crypto';

export const itineraryModel = {
  create: async ({ trip_id, user_id, summary = '', ai_response = '', itinerary_json }) => {
    const jsonStr = typeof itinerary_json === 'string' ? itinerary_json : JSON.stringify(itinerary_json);
    const existing = await itineraryModel.findByTripId(trip_id);

    // Parse title/destination if available from itinerary_json object
    let parsedObj = {};
    if (typeof itinerary_json === 'object' && itinerary_json !== null) {
      parsedObj = itinerary_json;
    } else {
      try { parsedObj = JSON.parse(jsonStr); } catch (e) {}
    }
    const titleVal = parsedObj.tripSummary?.destination || parsedObj.destination || 'Trip Itinerary';
    const destVal = parsedObj.tripSummary?.destination || parsedObj.destination || 'Destination';

    if (existing) {
      const updates = ['summary = ?', 'ai_response = ?', 'itinerary_json = ?'];
      const params = [summary, ai_response, jsonStr];
      if (user_id) {
        updates.push('user_id = ?');
        params.push(user_id);
      }
      params.push(trip_id);
      await dbRun(`UPDATE itineraries SET ${updates.join(', ')} WHERE trip_id = ?`, params);
      return itineraryModel.findByTripId(trip_id);
    } else {
      const id = crypto.randomUUID();
      await dbRun(
        `INSERT INTO itineraries (id, trip_id, user_id, summary, ai_response, itinerary_json) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, trip_id, user_id, summary, ai_response, jsonStr]
      );
      return itineraryModel.findByTripId(trip_id);
    }
  },

  findByTripId: async (trip_id) => {
    const row = await dbGet(`SELECT * FROM itineraries WHERE trip_id = ?`, [trip_id]);
    if (row && row.itinerary_json) {
      try {
        row.itinerary_data = JSON.parse(row.itinerary_json);
      } catch (e) {
        row.itinerary_data = null;
      }
    }
    return row;
  },

  deleteByTripId: async (trip_id) => {
    return await dbRun(`DELETE FROM itineraries WHERE trip_id = ?`, [trip_id]);
  },

  createShareLink: async (trip_id, expires_at = null) => {
    const existing = await dbGet(`SELECT * FROM share_links WHERE trip_id = ?`, [trip_id]);
    if (existing) {
      return existing;
    }
    const id = crypto.randomUUID();
    const share_token = crypto.randomBytes(16).toString('hex');
    await dbRun(
      `INSERT INTO share_links (id, trip_id, share_token, expires_at, is_active) VALUES (?, ?, ?, ?, TRUE)`,
      [id, trip_id, share_token, expires_at]
    );
    return await dbGet(`SELECT * FROM share_links WHERE id = ?`, [id]);
  },

  findShareByToken: async (share_token) => {
    return await dbGet(`SELECT * FROM share_links WHERE share_token = ? AND is_active = TRUE`, [share_token]);
  },

  incrementShareViews: async (share_id) => {
    return await dbRun(`UPDATE share_links SET views_count = views_count + 1 WHERE id = ?`, [share_id]);
  },

  findShareLinksByTrip: async (trip_id) => {
    return await dbAll(`SELECT * FROM share_links WHERE trip_id = ? ORDER BY created_at DESC`, [trip_id]);
  },

  deactivateShareLink: async (share_token) => {
    return await dbRun(`UPDATE share_links SET is_active = FALSE WHERE share_token = ?`, [share_token]);
  },

  updateShareToken: async (oldToken, newToken) => {
    return await dbRun(`UPDATE share_links SET share_token = ? WHERE share_token = ?`, [newToken, oldToken]);
  }
};

export default itineraryModel;
