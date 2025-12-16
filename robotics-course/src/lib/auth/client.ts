/**
 * Custom Auth Client
 * Communicates with Express API server for authentication
 */

// Use relative path for Vercel serverless functions, localhost for development
const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? '' // Use relative path in production (Vercel)
  : 'http://localhost:3001';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthError {
  message: string;
}

interface SignInResult {
  data?: AuthResponse;
  error?: AuthError;
}

interface SignUpResult {
  data?: AuthResponse;
  error?: AuthError;
}

interface SessionResult {
  data?: { user: User | null };
  error?: AuthError;
}

// Helper to get token from localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Helper to set token in localStorage
function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

// Helper to remove token from localStorage
function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// Helper to get user from localStorage
function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Helper to set user in localStorage
function setStoredUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Helper to remove user from localStorage
function removeStoredUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}

// Sign in with email and password
async function signInEmail(params: { email: string; password: string }): Promise<SignInResult> {
  try {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle both error formats: { error: string } and { error: { message: string } }
      const errorMessage = typeof data.error === 'string'
        ? data.error
        : data.error?.message || 'Sign in failed';
      return { error: { message: errorMessage } };
    }

    // Store token and user
    setToken(data.token);
    setStoredUser(data.user);

    return { data };
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: { message: 'Network error. Please try again.' } };
  }
}

// Sign up with email and password
async function signUpEmail(params: { email: string; password: string; name: string }): Promise<SignUpResult> {
  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle both error formats: { error: string } and { error: { message: string } }
      const errorMessage = typeof data.error === 'string'
        ? data.error
        : data.error?.message || 'Sign up failed';
      return { error: { message: errorMessage } };
    }

    // Store token and user
    setToken(data.token);
    setStoredUser(data.user);

    return { data };
  } catch (error) {
    console.error('Sign up error:', error);
    return { error: { message: 'Network error. Please try again.' } };
  }
}

// Get current session
async function getSession(): Promise<SessionResult> {
  try {
    const token = getToken();

    // If no token, return null user
    if (!token) {
      return { data: { user: null } };
    }

    const response = await fetch(`${API_URL}/api/auth/session`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.user) {
      // Clear stored data if session invalid
      removeToken();
      removeStoredUser();
      return { data: { user: null } };
    }

    // Update stored user
    setStoredUser(data.user);

    return { data: { user: data.user } };
  } catch (error) {
    return { data: { user: getStoredUser() } };
  }
}

// Get user synchronously from localStorage (for immediate UI display)
function getCurrentUser(): User | null {
  return getStoredUser();
}

// Check if user is logged in
function isLoggedIn(): boolean {
  return getToken() !== null && getStoredUser() !== null;
}

// Sign out
async function signOut(): Promise<{ error?: AuthError }> {
  try {
    const token = getToken();

    if (token) {
      await fetch(`${API_URL}/api/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Remove token and user regardless of response
    removeToken();
    removeStoredUser();

    return {};
  } catch (error) {
    removeToken();
    removeStoredUser();
    return { error: { message: 'Sign out failed' } };
  }
}

// React hook for session (simple implementation)
function useSession() {
  return {
    data: null,
    isPending: false,
    error: null,
  };
}

// Auth client object matching Better-Auth API structure
export const authClient = {
  signIn: {
    email: signInEmail,
  },
  signUp: {
    email: signUpEmail,
  },
  signOut,
  getSession,
  getCurrentUser,
  isLoggedIn,
  useSession,
};

// Export individual methods for convenience
export { signInEmail as signIn, signUpEmail as signUp, signOut, getSession, getCurrentUser, isLoggedIn, useSession };
