import Cookies from 'js-cookie';
import axios from 'axios';

export function getToken(): string | undefined {
  return Cookies.get('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getUserRole(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role || null;
  } catch {
    return null;
  }
}

export function getUserTenantId(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.tenant_id || null;
  } catch {
    return null;
  }
}

export function getUserEmail(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    // Usually 'sub' contains the user email or ID. We can check our backend routes or call /me to get it.
    // If not in payload, we get it from client state / localStorage or decode from token claims.
    return decoded.email || decoded.sub || null;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<any> {
  const response = await axios.post(`/api/v1/auth/login`, {
    email,
    password,
  });
  
  if (response.data && response.data.access_token) {
    Cookies.set('token', response.data.access_token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
  return response.data;
}

export async function register(name: string, email: string, password: string): Promise<any> {
  const response = await axios.post(`/api/v1/auth/register`, {
    name,
    email,
    password,
  });
  
  if (response.data && response.data.access_token) {
    Cookies.set('token', response.data.access_token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
  return response.data;
}

export async function getGoogleOAuthUrl(): Promise<string> {
  const response = await axios.get(`/api/v1/auth/oauth/google/url`);
  return response.data.url;
}

export async function loginWithGoogle(code: string, state: string): Promise<any> {
  const response = await axios.post(`/api/v1/auth/oauth/google/callback`, {
    code,
    state,
  });

  if (response.data && response.data.access_token) {
    Cookies.set('token', response.data.access_token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
  return response.data;
}

export function logout(): void {
  Cookies.remove('token');
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

export function getTenantId(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.tenant_id || null;
  } catch {
    return null;
  }
}
