export interface UserSession {
  name: string;
  email: string;
}

export const USER_SESSION_KEY = "alex_foster_user_session";
export const REGISTERED_USERS_KEY = "alex_foster_registered_users";

export function getUserSession(): UserSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.name === "string" && typeof parsed.email === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setUserSession(session: UserSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    // Also save to permanent registered users list
    saveRegisteredUser(session);
  } catch (err) {
    console.error("Failed to save user session", err);
  }
}

export function clearUserSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_SESSION_KEY);
  } catch (err) {
    console.error("Failed to clear user session", err);
  }
}

export function hasUserSession(): boolean {
  return getUserSession() !== null;
}

/**
 * Returns list of all previously registered users (email & name pairs).
 */
export function getRegisteredUsers(): UserSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (u): u is UserSession =>
          Boolean(u && typeof u.name === "string" && typeof u.email === "string")
      );
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Iterates through all registered emails to check if an email already exists.
 * Case-insensitive comparison. Returns the user session or null.
 */
export function findRegisteredUser(email: string): UserSession | null {
  if (!email || typeof window === "undefined") return null;
  const users = getRegisteredUsers();
  const normalized = email.trim().toLowerCase();
  const match = users.find(
    (u) => u.email && u.email.trim().toLowerCase() === normalized
  );
  return match || null;
}

/**
 * Saves or updates a user in the persistent registry across sign-outs.
 */
export function saveRegisteredUser(user: UserSession): void {
  if (typeof window === "undefined") return;
  try {
    const users = getRegisteredUsers();
    const normalized = user.email.trim().toLowerCase();
    const index = users.findIndex(
      (u) => u.email && u.email.trim().toLowerCase() === normalized
    );

    const record: UserSession = {
      name: user.name.trim(),
      email: user.email.trim(),
    };

    if (index >= 0) {
      users[index] = record;
    } else {
      users.push(record);
    }

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Failed to save registered user", err);
  }
}

