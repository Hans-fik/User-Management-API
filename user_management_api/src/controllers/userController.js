import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/db.js';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';
import bcrypt from 'bcryptjs';

import { findById, updateUser, deleteUser, updateAvatar } from '../models/userModel.js';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => typeof password === 'string' && password.length >= 8;

export const getUsers = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id, username, email, role, avatar_url, created_at, updated_at FROM users');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Update profil user sendiri (password optional)
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, email, password } = req.body;

    const targetUser = await findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'User tidak ditemukan' });

    // Validate types if provided
    if (username !== undefined && typeof username !== 'string') {
      return res.status(400).json({ message: 'Username harus berupa teks' });
    }
    if (email !== undefined && !isValidEmail(email)) {
      return res.status(400).json({ message: 'Format email tidak valid' });
    }
    if (password !== undefined && !isValidPassword(password)) {
      return res.status(400).json({ message: 'Password minimal 8 karakter' });
    }

    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await updateUser(userId, {
      username: username ?? null,
      email: email ?? null,
      passwordHash
    });

    res.json({ message: 'Profil berhasil diperbarui', user: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const deleted = await deleteUser(userId);
    if (!deleted) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json({ message: 'Akun berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Tidak ada file diunggah' });
    const userId = req.user.id;

    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'avatars' },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadStream();
    const updated = await updateAvatar(userId, result.secure_url);

    res.json({ message: 'Avatar berhasil diunggah', avatar: updated });
  } catch (err) {
    next(err);
  }
};