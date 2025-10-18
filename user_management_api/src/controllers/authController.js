import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findByEmail, createUser } from '../models/userModel.js';

// Validators
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => typeof password === 'string' && password.length >= 8;

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Semua input harus berupa teks (string)' });
    }

    if (!isValidEmail(email)) return res.status(400).json({ message: 'Format email tidak valid' });
    if (!isValidPassword(password)) return res.status(400).json({ message: 'Password minimal 8 karakter' });

    const existing = await findByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email sudah terdaftar' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await createUser(username, email, hashed);

    // Optionally sign token immediately after register
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(201).json({ message: 'User registered successfully', user: newUser, token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email)) return res.status(400).json({ message: 'Format email tidak valid' });
    if (!isValidPassword(password)) return res.status(400).json({ message: 'Password minimal 8 karakter' });

    const user = await findByEmail(email);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Email atau password salah' });

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ message: 'Login berhasil', token });
  } catch (err) {
    next(err);
  }
};