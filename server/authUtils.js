import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('base64url');
  const derivedKey = await scryptAsync(String(password), salt, KEY_LENGTH);
  return `scrypt$${salt}$${derivedKey.toString('base64')}`;
}

export function isPasswordHash(value) {
  return typeof value === 'string' && value.startsWith('scrypt$');
}

export async function verifyPassword(password, storedPassword) {
  if (!password || !storedPassword) return false;

  if (!isPasswordHash(storedPassword)) {
    return String(password) === String(storedPassword);
  }

  const [, salt, storedKey] = storedPassword.split('$');
  if (!salt || !storedKey) return false;

  const storedBuffer = Buffer.from(storedKey, 'base64');
  const derivedKey = await scryptAsync(String(password), salt, storedBuffer.length);
  return (
    storedBuffer.length === derivedKey.length &&
    timingSafeEqual(storedBuffer, derivedKey)
  );
}

export function withoutPassword(record) {
  if (!record) return record;
  const { password, pin, ...safeRecord } = record;
  return safeRecord;
}
