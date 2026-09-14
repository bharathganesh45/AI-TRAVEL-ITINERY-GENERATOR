import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';
import { generateToken } from '../config/jwt.js';

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export async function register(req, res) {
  try {
    const { name, email, password, profile_image } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required fields.' });
    }

    const nameStr = String(name).trim();
    if (nameStr.length === 0 || nameStr.length > 255) {
      return res.status(400).json({ error: 'Name must be between 1 and 255 characters.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
      name: nameStr,
      email,
      password_hash,
      profile_image: profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nameStr)}`,
    });

    const token = generateToken({ id: newUser.id, email: newUser.email, name: newUser.name });

    return res.status(201).json({
      user: newUser,
      token,
    });
  } catch (error) {
    console.error(' Registration controller error:', error);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    const { password_hash, ...userWithoutPassword } = user;

    return res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error(' Login controller error:', error);
    return res.status(500).json({ error: 'Failed to authenticate user.' });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    return res.json({ user });
  } catch (error) {
    console.error(' Get profile controller error:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, profile_image, current_password, new_password } = req.body;
    const userId = req.user.id;

    if (name !== undefined) {
      const nameStr = String(name).trim();
      if (nameStr.length > 0 && nameStr.length > 255) {
        return res.status(400).json({ error: 'Name must not exceed 255 characters.' });
      }
    }

    let updatedUser = await userModel.update(userId, { name, profile_image });

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }

      if (new_password.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      }

      const fullUser = await userModel.findByEmail(req.user.email);
      const isMatch = await bcrypt.compare(current_password, fullUser.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password does not match.' });
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(new_password, salt);
      await userModel.updatePassword(userId, newHash);
      updatedUser = await userModel.findById(userId);
    }

    return res.json({ user: updatedUser, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error(' Update profile controller error:', error);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
}

export async function logout(_req, res) {
  return res.json({ message: 'Logged out successfully.' });
}

export default { register, login, getProfile, updateProfile, logout };
