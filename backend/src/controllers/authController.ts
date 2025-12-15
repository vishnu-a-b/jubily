import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { comparePassword } from '../utils/hashPassword';

interface User {
  username: string;
  password: string;
  role: 'user' | 'admin';
}

// Load users from environment variables
function loadUsers(): User[] {
  const users: User[] = [];

  for (let i = 1; i <= 7; i++) {
    const userEnv = process.env[`USER_${i}`];
    if (userEnv) {
      const [username, password, role] = userEnv.split(':');
      users.push({
        username,
        password,
        role: role as 'user' | 'admin'
      });
    }
  }

  return users;
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const users = loadUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRY || '8h' }
    );

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    return res.json({
      success: true,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie('token');
  return res.json({ success: true });
}

export function checkAuth(req: Request, res: Response) {
  // This route is protected by authenticateToken middleware
  // If we reach here, user is authenticated
  return res.json({
    authenticated: true,
    user: (req as any).user
  });
}
