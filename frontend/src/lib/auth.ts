import { authAPI } from './api';

export interface User {
  username: string;
  role: 'user' | 'admin';
}

export async function checkAuthentication(): Promise<{ authenticated: boolean; user?: User }> {
  try {
    const data = await authAPI.checkAuth();
    return {
      authenticated: true,
      user: data.user,
    };
  } catch (error) {
    return {
      authenticated: false,
    };
  }
}

export async function login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const data = await authAPI.login(username, password);
    return {
      success: true,
      user: {
        username: data.username,
        role: data.role,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Login failed',
    };
  }
}

export async function logout(): Promise<void> {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  }
}
