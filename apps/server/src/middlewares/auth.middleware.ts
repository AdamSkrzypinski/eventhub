import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserPayload {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    res.status(401).json({ error: 'Brak tokenu autoryzacji' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'secret';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Nieprawidłowy lub wygasły token' });
      return;
    }
    req.user = decoded as UserPayload;
    next();
  });
};

export const requireRole = (role: 'ADMIN' | 'USER') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ error: 'Brak wystarczających uprawnień' });
      return;
    }
    next();
  };
};