import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// Find by email
export const findByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const { rows } = await pool.query(query, [email]);
  return rows.length ? rows[0] : null;
};

// Find by id (don't return password)
export const findById = async (id) => {
  const query = 'SELECT id, username, email, role, avatar_url, created_at, updated_at FROM users WHERE id = $1';
  const { rows } = await pool.query(query, [id]);
  return rows.length ? rows[0] : null;
};

// Create user (expects password already hashed)
export const createUser = async (username, email, passwordHash) => {
  const query = `
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, username, email, role, avatar_url, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [username, email, passwordHash]);
  return rows[0];
};

// Update user by id. data may contain username, email, password (hashed)
export const updateUser = async (id, data = {}) => {
  // Use COALESCE in SQL to keep existing values when passing null
  const { username = null, email = null, passwordHash = null } = data;

  const query = `
    UPDATE users
    SET username = COALESCE($1, username),
        email = COALESCE($2, email),
        password = COALESCE($3, password),
        updated_at = NOW()
    WHERE id = $4
    RETURNING id, username, email, role, avatar_url, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [username, email, passwordHash, id]);
  return rows.length ? rows[0] : null;
};

// Delete user
export const deleteUser = async (id) => {
  const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
  const { rows } = await pool.query(query, [id]);
  return rows.length ? rows[0] : null;
};

// Update avatar_url
export const updateAvatar = async (id, url) => {
  const query = `
    UPDATE users
    SET avatar_url = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING avatar_url, updated_at
  `;
  const { rows } = await pool.query(query, [url, id]);
  return rows.length ? rows[0] : null;
};