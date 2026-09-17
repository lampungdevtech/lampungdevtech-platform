import { ulid as generateUlid } from 'ulid';

export function getULID(): string {
  try {
    return generateUlid();
  } catch (e) {
    // Fallback pseudo-ulid based on timestamp + random hex
    const time = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${time}${rand}`.padStart(26, '0');
  }
}
