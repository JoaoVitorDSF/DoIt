import jwt from 'jsonwebtoken';

export const generateToken = (userId: number, userType: 'admin' | 'client'): string => {
  const secret = process.env.JWT_SECRET || 'secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  // @ts-ignore - Type definition issue with expiresIn
  return jwt.sign(
    { userId, userType },
    secret,
    { expiresIn }
  );
};
