import { dbGet, dbRun } from '../config/db.js';
import crypto from 'crypto';

export const userModel = {
  findByEmail: async (email) => {
    return await dbGet('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  },

  findById: async (id) => {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) return null;
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  create: async ({ name, email, password_hash, profile_image = '' }) => {
    const id = crypto.randomUUID();
    await dbRun(
      `INSERT INTO users (id, name, email, password_hash, profile_image) VALUES (?, ?, ?, ?, ?)`,
      [id, name, email.toLowerCase(), password_hash, profile_image]
    );
    return userModel.findById(id);
  },

  update: async (id, { name, profile_image }) => {
    await dbRun(
      `UPDATE users SET name = COALESCE(?, name), profile_image = COALESCE(?, profile_image), updated_at = NOW() WHERE id = ?`,
      [name, profile_image, id]
    );
    return userModel.findById(id);
  },

  updatePassword: async (id, password_hash) => {
    return await dbRun(`UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`, [password_hash, id]);
  }
};

export default userModel;
