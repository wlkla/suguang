import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key'
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d'

export interface AuthRequest extends Request {
  user?: {
    id: number
    username: string
    email: string
  }
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

export const generateToken = (payload: object): string => {
  return (jwt as any).sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE })
}

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET)
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const user = verifyToken(token)
    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}